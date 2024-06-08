import json
import pika
import time
import structlog

from django.conf import settings
from typing import Optional
from dataclasses import dataclass

ROUTING_KEY = "circularproduct.created.key"
EXCHANGE = "circularproduct_exchange"

logger = structlog.get_logger(__name__)


@dataclass(frozen=True, slots=True)
class CircularProductCreated:
    id: int
    description: str
    product_weight: str
    product_brand: Optional[str] = None

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "product_weight": self.product_weight,
            "product_brand": self.product_brand,
        }


class CircularProductCreatedProducer:
    def __init__(self) -> None:
        self.retries = 0
        while not self.connect():
            self.retries += 1
            if self.retries > 3:
                logger.error("Max retries reached")
                time.sleep(5)
                break

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

    def publish(self, body: CircularProductCreated):
        # properties = pika.BasicProperties(method)

        try:
            self.channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=ROUTING_KEY,
                body=json.dumps(body.to_dict()),
                # properties=properties,
            )
        except Exception as e:
            logger.error("Error publishing message", error=e)
            raise Exception("Error publishing CircularProductCreated") from e
