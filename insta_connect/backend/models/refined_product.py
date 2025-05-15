from mongoengine import Document, StringField, ReferenceField, ListField, DateTimeField
from datetime import datetime

class RefinedProduct(Document):
    user_id = ReferenceField('User', required=True)
    media_files = ListField(ReferenceField('Media'), required=True)
    media_type = StringField(required=True, choices=["image", "video"])
    media_url = StringField(required=True)
    product_name = StringField(required=True)
    description = StringField()
    category = StringField(required=True)
    processed_at = DateTimeField()
    amazon_ready_product = ReferenceField('AmazonListedReady')

    meta = {
        'collection': 'refined_products'
    }
