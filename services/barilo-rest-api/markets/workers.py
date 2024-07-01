from rabbitmq.worker import BaseWorker
from markets.consumers import ProductConsumer
import structlog

logger = structlog.get_logger(__name__)


class ProductWorker(BaseWorker):
    def __init__(self, consumer: ProductConsumer):
        super().__init__(consumer)
