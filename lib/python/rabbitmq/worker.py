from abc import ABC
from rabbitmq.consumer import BaseConsumer


class BaseWorker(ABC):
    """This is an example consumer that will reconnect if the nested
    ExampleConsumer indicates that a reconnect is necessary.

    """

    def __init__(self, consumer: BaseConsumer):
        self._reconnect_delay = 0
        # self._amqp_url = amqp_url
        self._consumer = consumer

    def run(self):
        while True:
            try:
                self._consumer.run()
            except KeyboardInterrupt:
                self._consumer.stop()
                break

    def _get_reconnect_delay(self):
        if self._consumer.was_consuming:
            self._reconnect_delay = 0
        else:
            self._reconnect_delay += 1
        if self._reconnect_delay > 30:
            self._reconnect_delay = 30
        return self._reconnect_delay
