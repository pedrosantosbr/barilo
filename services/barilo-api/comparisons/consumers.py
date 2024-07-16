import json
import uuid
from django.db import transaction
from pika.exchange_type import ExchangeType

from rabbitmq.consumer import BlockingBaseConsumer
from barilo.schemas.events import ProductCreatedEvent
from barilo.agolia.product import Product as AgoliaProduct
from comparisons.models import ProductBucket, ProductBucketItem
from products.models import Product

import structlog

logger = structlog.get_logger(__name__)


class SearchException(Exception):
    message: str

    def __init__(self, message: str, *args: object) -> None:
        super().__init__(*args)
        self.message = message


class AgoliaSearchRabbitMQConsumer(BlockingBaseConsumer):
    EXCHANGE = "products_exchange"
    EXCHANGE_TYPE = ExchangeType.topic
    QUEUE = "search_queue"
    ROUTING_KEY = "product.*.key"

    _id: str

    def __init__(self, amqp_url):
        super().__init__(amqp_url)
        self._id = str(uuid.uuid4())

    def consume_message(self, topic: str, body: bytes):
        body = body.decode("utf-8")
        logger.info("👾 [x] Processing message:", _id=self._id, topic=topic, body=body)

        message = json.loads(body)

        # XXX: product.uploaded.key
        if topic == "product.uploaded.key":
            params = ProductCreatedEvent(**message)

            logger.info("👾 [x] Processing message:", _id=self._id, params=params)

            if params["brand"] is not None:
                product_index_name = (
                    f"{params.get('brand', '')} {params['name']} {params['weight']}"
                ).strip()
            else:
                product_index_name = f"{params['name']} {params['weight']}"

            with transaction.atomic():
                # try:
                #     mid = params["market"]["id"]
                #     market = Market.objects.get(id=mid)
                # except Market.DoesNotExist as e:
                #     logger.error(f"Market not found with id: {mid}")
                #     raise SearchException(f"Market not found for id {mid}") from e

                # try:
                #     product_idx = ProductIndex.objects.create(
                #         name=product_index_name,
                #         price=params["price"],
                #         weight=params["weight"],
                #         brand=params.get("brand", None),
                #         address=params["market"]["address"],
                #         market=market,
                #     )
                # except Exception as e:
                #     logger.error(f"Failed to create product index {product_index_name}")
                #     raise SearchException(
                #         f"Failed to create {product_index_name} on postgresql"
                #     ) from e

                try:
                    agl_product = AgoliaProduct()
                    agl_product.create(
                        name=product_index_name,
                        weight=params["weight"],
                        brand=params.get("brand", None),
                        objectID=params["id"],
                    )
                except Exception as e:
                    logger.error(
                        f"Failed to save {product_index_name} on Agolia", msg=str(e)
                    )
                    raise SearchException(
                        f"Failed to save {product_index_name} index on Agolia"
                    ) from e


class PostgresqlBucketRabbitMQConsumer(BlockingBaseConsumer):
    EXCHANGE = "products_exchange"
    EXCHANGE_TYPE = ExchangeType.topic
    QUEUE = "bucket_queue"
    ROUTING_KEY = "product.*.key"

    _id: str

    def __init__(self, amqp_url):
        super().__init__(amqp_url)
        self._id = str(uuid.uuid4())

    def consume_message(self, topic: str, body: bytes):
        body = body.decode("utf-8")
        logger.info("👾 [x] Processing message:", _id=self._id, topic=topic, body=body)

        message = json.loads(body)

        # XXX: product.uploaded.key
        if topic == "product.uploaded.key":
            params = ProductCreatedEvent(**message)

            logger.info("👾 [x] Processing message:", _id=self._id, params=params)

            if params["brand"] is not None:
                product_index_name = (
                    f"{params.get('brand', '')} {params['name']} {params['weight']}"
                ).strip()
            else:
                product_index_name = f"{params['name']} {params['weight']}"

            with transaction.atomic():
                try:
                    product = Product.objects.get(id=params["id"])
                except Product.DoesNotExist as e:
                    logger.error(f"Product not found with id: {params['id']}")
                    raise SearchException(
                        f"Product not found for id {params['id']}"
                    ) from e

                try:
                    bucket, _ = ProductBucket.objects.get_or_create(
                        name=product_index_name
                    )
                except Exception as e:
                    logger.error(f"Failed to create bucket {product_index_name}")
                    raise SearchException(
                        f"Failed to create bucket {product_index_name}"
                    ) from e

                try:
                    ProductBucketItem.objects.create(bucket=bucket, product=product)
                except Exception as e:
                    logger.error(f"Failed to create bucket item {product_index_name}")
                    raise SearchException(
                        f"Failed to create bucket item {product_index_name}"
                    ) from e
