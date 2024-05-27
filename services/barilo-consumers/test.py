from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# documents = ["Arroz Palmares 5kg tipo 1", "Arroz Palmares 5kg"]


# documents = ["Costela Bovina p/ cozinhar KG", "Costela bovina kg"]
# cosine_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
# print(f"Similarity: {cosine_sim[0][0] * 100}%")

from rapidfuzz import fuzz


class CircularProduct(dict):
    description: str
    discount_price: float
    weight: str
    brand: Optional[str]


def test_similarity(cp1: CircularProduct, cp2: CircularProduct):
    if cp1["brand"] != cp2["brand"]:
        return 0
    if cp1["weight"] != cp2["weight"]:
        return 0

    # return fuzz.ratio(cp1["description"], cp2["description"])
    tfidf = TfidfVectorizer().fit_transform([cp1["description"], cp2["description"]])
    cosine_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
    print(f"Similarity: {cosine_sim[0][0] * 100}%")


cp1 = {
    "description": "Azeitonas verdes la violetera s/ caroço e fatiada 250g líquido",
    "discount_price": 10.99,
    "weight": "la violetera",
    "brand": "Palmares",
}

cp2 = {
    "description": "Azeitonas verdes la violetera c/ caroço 250g líquido",
    "discount_price": 10.99,
    "weight": "la violetera",
    "brand": "Palmares",
}

similarity = test_similarity(cp1, cp2)
# print(f"Similarity: {similarity}%")
