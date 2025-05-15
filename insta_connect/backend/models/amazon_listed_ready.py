from mongoengine import Document, StringField, ReferenceField, ListField, IntField, BooleanField, DictField, DateTimeField
from datetime import datetime

class AmazonListedReady(Document):
    user_id = ReferenceField('User', required=True)
    refined_product = ReferenceField('RefinedProduct', required=True)
    product_name = StringField(required=True)
    description = StringField(required=True)
    keywords = ListField(StringField(), required=True)
    images = ListField(StringField(), required=True)
    primary_image = StringField(required=True)
    category = StringField(required=True)
    dimensions = DictField(required=True)  # {height, width, depth, weight}
    price = StringField(required=True)
    stock_quantity = IntField(required=True)
    compliance_check = BooleanField(required=True)
    amazon_listing_id = StringField(unique=True)
    listing_status = StringField(required=True, choices=["Draft", "Published", "Archived"])
    brand = StringField(required=True)
    bullet_points = ListField(StringField(), required=True)
    asin = StringField(unique=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'amazon_listed_ready'
    }
