import json
import pika
import time
import structlog

from django.conf import settings
from barilo.schemas.events import ProductEvent

EXCHANGE = "products_exchange"

logger = structlog.get_logger(__name__)


class ProductCreatedProducer:
    def __init__(self) -> None:
        self.retries = 0
        while not self.connect():
            self.retries += 1
            if self.retries > 3:
                logger.error("Max retries reached")
                time.sleep(5)
                break

    # TODO: move this method to an abstract class
    def connect(self):
        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    settings.RABBITMQ_HOST,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                    credentials=pika.PlainCredentials(
                        settings.RABBITMQ_USER, settings.RABBITMQ_PASSWORD
                    ),
                )
            )
            self.channel = self.connection.channel()
            # self.channel.exchange_declare(
            #     exchange=EXCHANGE, exchange_type="topic", durable=True
            # )
            return True
        except Exception as e:
            logger.error("Error connecting to RabbitMQ", error=e)
            return False

    def publish(self, body: ProductEvent):
        # properties = pika.BasicProperties(method)

        try:
            self.channel.basic_publish(
                exchange=EXCHANGE,
                routing_key="product.uploaded.key",
                body=json.dumps(body.to_dict()),
                # properties=properties,
            )
        except Exception as e:
            logger.error("Error publishing message", error=e)
            raise Exception("Error publishing ProductCreated") from e
