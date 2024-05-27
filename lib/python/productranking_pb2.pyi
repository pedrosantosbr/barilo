from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ProductRanking(_message.Message):
    __slots__ = ("id", "title_index", "weight_index", "brand_index")
    ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_INDEX_FIELD_NUMBER: _ClassVar[int]
    WEIGHT_INDEX_FIELD_NUMBER: _ClassVar[int]
    BRAND_INDEX_FIELD_NUMBER: _ClassVar[int]
    id: int
    title_index: str
    weight_index: str
    brand_index: str
    def __init__(self, id: _Optional[int] = ..., title_index: _Optional[str] = ..., weight_index: _Optional[str] = ..., brand_index: _Optional[str] = ...) -> None: ...

class ListRequest(_message.Message):
    __slots__ = ("title_index", "weight_index", "brand_index")
    TITLE_INDEX_FIELD_NUMBER: _ClassVar[int]
    WEIGHT_INDEX_FIELD_NUMBER: _ClassVar[int]
    BRAND_INDEX_FIELD_NUMBER: _ClassVar[int]
    title_index: str
    weight_index: str
    brand_index: str
    def __init__(self, title_index: _Optional[str] = ..., weight_index: _Optional[str] = ..., brand_index: _Optional[str] = ...) -> None: ...

class ListResponse(_message.Message):
    __slots__ = ("product_rankings",)
    PRODUCT_RANKINGS_FIELD_NUMBER: _ClassVar[int]
    product_rankings: _containers.RepeatedCompositeFieldContainer[ProductRanking]
    def __init__(self, product_rankings: _Optional[_Iterable[_Union[ProductRanking, _Mapping]]] = ...) -> None: ...

class CreateItemRequest(_message.Message):
    __slots__ = ("product_ranking_id", "circular_product_id")
    PRODUCT_RANKING_ID_FIELD_NUMBER: _ClassVar[int]
    CIRCULAR_PRODUCT_ID_FIELD_NUMBER: _ClassVar[int]
    product_ranking_id: int
    circular_product_id: int
    def __init__(self, product_ranking_id: _Optional[int] = ..., circular_product_id: _Optional[int] = ...) -> None: ...

class CreateItemResponse(_message.Message):
    __slots__ = ("product_ranking_item_id",)
    PRODUCT_RANKING_ITEM_ID_FIELD_NUMBER: _ClassVar[int]
    product_ranking_item_id: int
    def __init__(self, product_ranking_item_id: _Optional[int] = ...) -> None: ...
