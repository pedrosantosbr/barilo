from comparisons.interfaces import SearchService
import structlog

logger = structlog.get_logger(__name__)


class AgoliaSearchService(SearchService):
    def update_products_catalog(self, *args, **kwargs):
        logger.info("👾 [x] fetching agolia...", args=args, kwargs=kwargs)
