from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Market:
    id: str
    name: str

@dataclass
class Location:
    id: str
    address: str
    cep: str

@dataclass(frozen=True, slots=True)
class Product:
    id: str
    name: str
    price: float
    weight: str
    brand: Optional[str] = field(default=None)

@dataclass(frozen=True, slots=True)
class ProductEvent:
    market: Market
    location: Location
    product: Product
    
    # def to_dict(self):
    #     return {
    #         "id": str(self.id),
    #         "description": self.description,
    #         "product_weight": self.product_weight,
    #         "product_brand": self.product_brand,
    #     }