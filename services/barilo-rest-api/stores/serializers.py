from rest_framework import serializers
from stores.models import Store, Circular, Product, CircularProduct


class UploadCircularSerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()
    expiration_date = serializers.DateTimeField()
    csv = serializers.FileField()


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CircularProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = CircularProduct
        fields = "__all__"


class CircularSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circular
        fields = "__all__"


class SearchCircularSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    items = CircularProductSerializer(
        source="circularproduct_set", many=True, read_only=True
    )

    class Meta:
        model = Circular
        fields = ["id", "title", "description", "store", "expiration_date", "items"]


class RankCircularProductListSerializer(serializers.ModelSerializer):
    stores = serializers.SerializerMethodField()
    discount_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_discount_price(self, obj):
        # Assuming you want the discount_price from the first related CircularProduct
        circular_product = obj.circularproduct_set.first()
        if circular_product:
            return str(circular_product.discount_price)
        return None

    def get_stores(self, obj):
        # Assuming you want the store names from all related CircularProduct
        return [cp.circular.store.name for cp in obj.circularproduct_set.all()]
