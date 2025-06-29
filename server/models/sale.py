from mongoengine import Document, ReferenceField, DateTimeField, FloatField, StringField, IntField
from datetime import datetime
from .user import User
from .product import Product

class Sale(Document):
    user = ReferenceField(User, required=True)
    product = ReferenceField(Product, required=True)
    quantity = IntField(required=True, min_value=1)
    price_per_unit = FloatField(required=True)
    total_amount = FloatField(required=True)
    order_id = StringField(required=True)
    status = StringField(required=True, choices=['pending', 'completed', 'cancelled'])
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'sales',
        'indexes': [
            'user',
            'product',
            'order_id',
            ('user', 'product'),
            ('user', 'status'),
            'created_at'
        ]
    } 