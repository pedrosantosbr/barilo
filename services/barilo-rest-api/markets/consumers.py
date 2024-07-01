import json

from rabbitmq.consumer import BaseConsumer
from abc import ABC, abstractmethod
from dataclasses import dataclass

import structlog

logger = structlog.get_logger(__name__)


@dataclass(frozen=True, slots=True)
class ProductPriceRankUpdated:
    product_id: int
    productcircular_id: int


class ProductService(ABC):
    @abstractmethod
    def update_product_price_rank(self, params):
        pass


class ProductConsumer(BaseConsumer):
    svc: ProductService

    def __init__(self, amqp_url, svc: ProductService):
        super().__init__(amqp_url)
        self.svc = svc

    def consume_message(self, topic: str, body: bytes):
        body = body.decode("utf-8")
        logger.info("👾 [x] Processing message: %s", topic=topic, body=body)

        message = json.loads(body)

        if topic == "circularproduct.created.key":
            try:
                params = ProductPriceRankUpdated(**message)
            except Exception as e:
                logger.info(
                    "👾 [x] Message does not match ProductPriceRankUpdated schema: %s",
                    e=e,
                )

            try:
                self.svc.update_product_price_rank(params)
            except Exception as e:
                logger.info(
                    "👾 [x] Error updating circular product price rank: %s", e=e
                )
