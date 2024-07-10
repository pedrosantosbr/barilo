# Description: Command to start RabbitMQ Consumer
# Advantages of Using Django Management Commands

# Consistent Environment:
#     Ensures that the Django environment is properly set up, similar to how it is for other management commands.
#     Automatically handles setting up the Django settings and Python path.

# Ease of Use:
#     Run the consumer using a standard Django command: python manage.py run_consumer.
#     Consistent with other Django commands, making it easier for developers to understand and maintain.

# Logging and Debugging:
#     Leverages Django's logging and exception handling mechanisms.
#     Easier to integrate with other Django management tools and scripts.

# Configuration Management:
#     Easier to pass arguments and options to the command using Django's built-in command argument parsing.

from django.core.management.base import BaseCommand
from markets.consumers import ProductConsumer, ProductService
from markets.workers import ProductWorker

import structlog

logger = structlog.get_logger(__name__)


class ProductServiceImpl(ProductService):
    def update_product_price_rank(self, params):
        logger.info("👾 [x] Updating product price rank: %s", params)


class Command(BaseCommand):
    help = "Launches Listener for user_created message : RaabitMQ"

    def handle(self, *args, **options):
        consumer = ProductConsumer(
            "amqp://barilo:barilo@barilo-rabbitmq:5672/%2F", ProductServiceImpl()
        )
        worker = ProductWorker(consumer)
        worker.run()

        self.stdout.write("Started Consumer Thread")
