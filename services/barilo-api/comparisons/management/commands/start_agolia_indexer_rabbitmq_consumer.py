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
from multiprocessing import Process
from django.core.management.base import BaseCommand
from django.conf import settings
from comparisons.consumers import AgoliaSearchRabbitMQConsumer


import structlog

logger = structlog.get_logger(__name__)


class Command(BaseCommand):
    help = "Starts the RabbitMQ Consumer for Agolia Indexer"

    def handle(self, *args, **options):
        consumer = AgoliaSearchRabbitMQConsumer(
            f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}@{settings.RABBITMQ_HOST}:5672/%2F",
        )

        for i in range(5):
            p = Process(target=consumer.run)
            p.start()
            p.join()
            logger.info("Consumer Process Started", process_id=p.pid)
