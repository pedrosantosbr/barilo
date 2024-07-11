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
from markets.consumers import SearchConsumer, SearchService

import structlog

logger = structlog.get_logger(__name__)


class ProductServiceImpl(SearchService):
    def update_products_catalog(self, params):
        logger.info("👾 [x] fetching agolia...", params=params)


class Command(BaseCommand):
    help = "Launches Listener for user_created message : RaabitMQ"

    def handle(self, *args, **options):
        consumer = SearchConsumer(
            "amqp://barilo:barilo@barilo-rabbitmq:5672/%2F", ProductServiceImpl()
        )
        # worker = ProductWorker(consumer)
        # worker.run()
        while True:
            try:
                self.stdout.write("Started Consumer Thread")
                consumer.run()
            except KeyboardInterrupt:
                consumer.stop()
                break

