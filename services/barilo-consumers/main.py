import os
import sys

# Add this line before the rest of the imports
sys.path.append(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../lib/python")
)

from consumers import CircularProductConsumer, CircularProductWorker
from services import CircularProductServiceImpl

import logging

import structlog

logger = structlog.get_logger(__name__)

logger.info("Booting the system...")

LOG_FORMAT = (
    "%(levelname) -10s %(asctime)s %(name) -30s %(funcName) "
    "-35s %(lineno) -5d: %(message)s"
)


def main():
    logging.basicConfig(level=logging.DEBUG, format=LOG_FORMAT)
    consumer = CircularProductConsumer(
        "amqp://barilo:barilo@localhost:5672/%2F", CircularProductServiceImpl()
    )
    worker = CircularProductWorker(consumer)
    worker.run()


if __name__ == "__main__":
    main()
