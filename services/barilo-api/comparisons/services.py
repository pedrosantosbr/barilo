from comparisons.interfaces import SearchService
import structlog

from barilo.schemas.events import ProductCreatedEvent

logger = structlog.get_logger(__name__)


class AgoliaSearchService(SearchService):
    def update_products_catalog(self, params: ProductCreatedEvent):
        logger.info("👾 [x] fetching agolia...")

        logger.info("👾 [x] Updated products catalog")
