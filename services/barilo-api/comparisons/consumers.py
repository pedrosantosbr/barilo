import json
import uuid
from django.db import transaction
from comparisons.models import ProductIndex
from markets.models import Market
from pika.exchange_type import ExchangeType

from rabbitmq.consumer import BlockingBaseConsumer
from barilo.schemas.events import ProductCreatedEvent
from comparisons.services import SearchService

import structlog

logger = structlog.get_logger(__name__)


class RabbitMQSearchConsumer(BlockingBaseConsumer):
    svc: SearchService

    EXCHANGE = "products_exchange"
    EXCHANGE_TYPE = ExchangeType.topic
    QUEUE = "search_queue"
    ROUTING_KEY = "product.*.key"

    _id: str

    def __init__(self, amqp_url, svc: SearchService):
        super().__init__(amqp_url)
        self.svc = svc
        self._id = str(uuid.uuid4())

    def consume_message(self, topic: str, body: bytes):
        body = body.decode("utf-8")
        logger.info("👾 [x] Processing message:", _id=self._id, topic=topic, body=body)

        message = json.loads(body)

        # XXX: product.uploaded.key
        if topic == "product.uploaded.key":
            params = ProductCreatedEvent(**message)

            product_index_name = (
                f"{params.get('brand', '')} {params['name']} {params['weight']}"
            ).strip()

            with transaction.atomic():
                market = Market.objects.get(id=params["market"]["id"])
                ProductIndex.objects.create(
                    name=product_index_name,
                    price=params["price"],
                    weight=params["weight"],
                    brand=params.get("brand", None),
                    address=params["market"]["address"],
                    market=market,
                )
                self.svc.update_products_catalog(params)
