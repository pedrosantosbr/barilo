from typing import Optional, TypedDict


class ProductCreatedEvent(TypedDict):
    class Market(TypedDict):
        id: str
        address: str

    id: str
    market: Market
    name: str
    price: float
    weight: str
    brand: Optional[str]
