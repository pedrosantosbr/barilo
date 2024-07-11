from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


import grpc
import structlog

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = structlog.get_logger(__name__)

import productranking_pb2, productranking_pb2_grpc  # noqa


@dataclass(frozen=True, slots=True)
class CircularProductCreated:
    id: int
    description: str
    product_weight: str
    product_brand: Optional[str] = None


class CircularProductService(ABC):
    @abstractmethod
    def update_circular_product_price_rank(self, params):
        """Process the failed request from DataForSEO API."""
        pass


# -


class CircularProductServiceImpl(CircularProductService):
    def __init__(self):
        super().__init__()

    def update_circular_product_price_rank(self, params: CircularProductCreated):
        logger.info("🎃 update_circular_product_price_rank", params=params)

        # NOTE(gRPC Python Team): .close() is possible on a channel and should be
        # used in circumstances in which the with statement does not fit the needs
        # of the code.
        #
        # For more channel options, please see https://grpc.io/grpc/core/group__grpc__arg__keys.html
        with grpc.insecure_channel(
            target="localhost:50051",
            options=[
                ("grpc.lb_policy_name", "pick_first"),
                ("grpc.enable_retries", 3),
                ("grpc.keepalive_timeout_ms", 10000),
            ],
        ) as channel:
            stub = productranking_pb2_grpc.ProductRankingServiceStub(channel)
            # Timeout in seconds.
            # Please refer gRPC Python documents for more detail. https://grpc.io/grpc/python/grpc.html
            response = stub.List(
                productranking_pb2.ListRequest(weight_index=params.product_weight),
                timeout=10,
            )

            logger.info("client received: ", product_rankings=response.product_rankings)

            response: productranking_pb2.ListResponse = response

            rankings = response.product_rankings

            if rankings is None or len(rankings) == 0:
                logger.info("No product rankings found")
                return

            # check similarity ranks
            for ranking in rankings:
                # collect the top rankings by similarity > 0.9
                potential_rankings = []
                similarity = check_similarity(params.description, ranking.title_index)
                if similarity > 0.9:
                    logger.info(
                        f"Found similar product {ranking.title_index} with similarity {similarity}"
                    )
                    potential_rankings.append(
                        {"ranking": ranking, "similarity": similarity}
                    )

                if len(potential_rankings) == 0:
                    logger.info("🎃 No similar product found")
                    continue

                match_ranking = max(potential_rankings, key=lambda x: x["similarity"])

                logger.info("Matched ranking", match_ranking=match_ranking["ranking"])

                # ranking: productranking_pb2.ProductRanking = next(
                #     filter(
                #         lambda x: x.title_index == match_ranking["ranking"], rankings
                #     )
                # )
                ranking = None
                for r in rankings:
                    if r.title_index == match_ranking["ranking"].title_index:
                        ranking = r
                        break

                if ranking is None:
                    logger.error("🚨 Ranking not found")
                    continue

                try:
                    stub.CreateItem(
                        productranking_pb2.CreateItemRequest(
                            product_ranking_id=ranking.id,
                            circular_product_id=params.id,
                        ),
                        timeout=5,
                    )
                    logger.info("👾 Requested item creation for product ranking")
                except Exception as e:
                    logger.error("🚨 Error creating item", error=e)
                    continue

            # update product ranking items


def check_similarity(a, b):
    """
    Check similarity between two strings
    returns a float between 0 and 1
    """
    tfidf = TfidfVectorizer().fit_transform([a, b])
    cosine_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
    return cosine_sim[0][0]
