from mongoengine import Document, StringField, ReferenceField, ListField, FloatField, DateTimeField
from datetime import datetime

class Product(Document):
    user_id = ReferenceField('User', required=True)
    media_id = ListField(ReferenceField('Media'), required=True)
    product_name = StringField(required=True)
    description = StringField(required=True)
    media_url = ListField(StringField(), required=True)
    product_category = StringField(required=True)
    price = FloatField()
    brand = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'products'
    }
