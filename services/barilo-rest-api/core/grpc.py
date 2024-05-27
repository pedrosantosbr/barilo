import sys
import os

import django
import logging
import structlog
import grpc

from collections import defaultdict
from django.apps import apps
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils import autoreload

from concurrent import futures

logger = structlog.get_logger(__name__)

sys.path.append(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../lib/python")
)


class ManagementUtility:
    """
    Encapsulate the logic of the django-admin and manage.py utilities.
    """

    def __init__(self, argv=None):
        self.argv = argv or sys.argv[:]
        self.prog_name = os.path.basename(self.argv[0])
        if self.prog_name == "__main__.py":
            self.prog_name = "python -m django"
        self.settings_exception = None

    def execute(self):
        """
        Given the command-line arguments, figure out which subcommand is being
        run, create a parser appropriate to that command, and run it.
        """
        try:
            subcommand = self.argv[1]
        except IndexError:
            subcommand = "help"  # Display help if no arguments were given.

        try:
            settings.INSTALLED_APPS
        except ImproperlyConfigured as exc:
            self.settings_exception = exc
        except ImportError as exc:
            self.settings_exception = exc

        if settings.configured:
            # Start the auto-reloading dev server even if the code is broken.
            # The hardcoded condition is a code smell but we can't rely on a
            # flag on the command class because we haven't located it yet.
            if subcommand == "rungrpc":
                try:
                    autoreload.check_errors(django.setup)()
                except Exception:
                    # The exception will be raised later in the child process
                    # started by the autoreloader. Pretend it didn't happen by
                    # loading an empty list of applications.
                    apps.all_models = defaultdict(dict)
                    apps.app_configs = {}
                    apps.apps_ready = apps.models_ready = apps.ready = True

            # In all other cases, django.setup() is required to succeed.
            else:
                django.setup()

        if self.settings_exception:
            logging.getLogger(__name__).error(
                "Settings are not configured",
                exc_info=self.settings_exception,
            )
            sys.exit(1)

        logger.info("Running gRPC server")
        logging.basicConfig(level=logging.INFO)

        # -

        import helloworld_pb2, helloworld_pb2_grpc  # noqa
        import productranking_pb2, productranking_pb2_grpc  # noqa

        from markets.models import Market, CircularProduct  # noqa
        from ranks.models import ProductRanking, ProductRankingItem  # noqa

        class ProductRankingServiceImplementation(
            productranking_pb2_grpc.ProductRankingService
        ):
            def List(self, request, context):
                queryset = ProductRanking.objects.all()

                response = []
                for ranking in queryset:
                    response.append(
                        productranking_pb2.ProductRanking(
                            id=ranking.id,
                            title_index=ranking.title_index,
                            weight_index=ranking.weight_index,
                            brand_index=ranking.brand_index,
                        )
                    )

                logger.info("✅ Product ranking list")
                return productranking_pb2.ListResponse(product_rankings=response)

            def CreateItem(self, request, context):
                request: productranking_pb2.CreateItemRequest = request

                try:
                    productrank = ProductRanking.objects.get(
                        id=request.product_ranking_id
                    )
                except ProductRanking.DoesNotExist:
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    context.set_details("Product ranking not found")
                    logger.error(
                        "Product ranking not found",
                        product_ranking_id=request.product_ranking_id,
                    )
                    return productranking_pb2.CreateItemResponse()

                try:
                    circularproduct = CircularProduct.objects.get(
                        pk=request.circular_product_id
                    )
                except CircularProduct.DoesNotExist:
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    context.set_details("Circular product not found")
                    logger.info("Circular product not found")
                    return productranking_pb2.CreateItemResponse()

                try:
                    productrankingitem = ProductRankingItem.objects.create(
                        expiration_date=circularproduct.circular.expiration_date,
                        rank=productrank,
                        circular_id=circularproduct.circular_id,
                        productcircular_id=circularproduct.id,
                        productcircular_description=circularproduct.description,
                        productcircular_discount_price=circularproduct.discount_price,
                        product_weight=circularproduct.product.weight,
                        product_brand=circularproduct.product.brand,
                    )
                except Exception as e:
                    context.set_code(grpc.StatusCode.INTERNAL)
                    context.set_details(str(e))
                    logger.info("Error creating product ranking item", error=e)
                    return productranking_pb2.CreateItemResponse()

                logger.info("✅ Product ranking item created")

                return productranking_pb2.CreateItemResponse(
                    product_ranking_item_id=productrankingitem.pk
                )

        def serve():
            port = "50051"
            server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

            productranking_pb2_grpc.add_ProductRankingServiceServicer_to_server(
                ProductRankingServiceImplementation(), server
            )

            server.add_insecure_port("[::]:" + port)
            server.start()
            print("Server started, listening on " + port)
            server.wait_for_termination()

        serve()


def execute_from_command_line(argv=None):
    """Run a ManagementUtility."""
    utility = ManagementUtility(argv)
    utility.execute()
