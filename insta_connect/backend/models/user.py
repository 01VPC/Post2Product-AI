from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField, ListField
from datetime import datetime

class User(Document):
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    instagram_connected = BooleanField(default=False)
    instagram_access_token = StringField()
    instagram_id = StringField()
    instagram_username = StringField()
    media = ListField(ReferenceField('Media'))
    products = ListField(ReferenceField('Product'))
    created_at = DateTimeField(default=datetime.utcnow)
    active = BooleanField(default=True)

    meta = {
        'collection': 'users',
        'indexes': ['email']
    }
