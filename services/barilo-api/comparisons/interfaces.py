from abc import ABC, abstractmethod

import structlog

logger = structlog.get_logger(__name__)


class SearchService(ABC):
    @abstractmethod
    def update_products_catalog(self, *args, **kwargs):
        logger.info(" [x] Updating products catalog", args=args, kwargs=kwargs)
