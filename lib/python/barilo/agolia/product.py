import os
from algoliasearch.search_client import SearchClient
from typing import Optional

APP_ID = os.getenv("AGOLIA_APP_ID", "")
API_KEY = os.getenv("AGOLIA_ADMIN_API_KEY", "")

client = SearchClient.create(APP_ID, API_KEY)

import structlog

logger = structlog.get_logger(__name__)


class Product:
    def __init__(self) -> None:
        self.cli = client
        index = self.cli.init_index("dev_product_index")
        self.idx = index

    def create(
        self,
        objectID: str,
        name: str,
        weight: str,
        brand: Optional[str],
    ):
        product = {
            "objectID": objectID,
            "name": name,
            "weight": weight,
        }
        if brand is not None:
            product["brand"] = brand

        logger.info(" [x] Creating product on Agolia", product=product)
        self.idx.save_object(product)

    def search(self, name: str):
        return self.idx.search(name)
