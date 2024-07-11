import json
from pika.exchange_type import ExchangeType

from rabbitmq.consumer import BaseConsumer
from abc import ABC, abstractmethod
from barilo.schemas.events import ProductEvent   

import structlog

logger = structlog.get_logger(__name__)


class SearchService(ABC):
    @abstractmethod
    def update_products_catalog(self, params):
        pass


class SearchConsumer(BaseConsumer):
    svc: SearchService

    EXCHANGE = "products_exchange"
    EXCHANGE_TYPE = ExchangeType.topic
    QUEUE = "search_queue"
    ROUTING_KEY = "product.*.key"

    def __init__(self, amqp_url, svc: SearchService):
        super().__init__(amqp_url)
        self.svc = svc

    def consume_message(self, topic: str, body: bytes):
        body = body.decode("utf-8")
        logger.info("👾 [x] Processing message: %s", topic=topic, body=body)

        message = json.loads(body)

        if topic == "product.uploaded.key":
            try:
                params = ProductEvent(**message)
            except Exception as e:
                logger.info(
                    "👾 [x] Message does not match ProductEvent schema: %s",
                    e=e,
                )
                raise e

            try:
                self.svc.update_product_price_rank(params)
            except Exception as e:
                logger.info(
                    "👾 [x] Error updating circular product price rank: %s", e=e
                )
                raise e
