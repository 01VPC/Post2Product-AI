from mongoengine import Document, StringField, ReferenceField, ListField, IntField, BooleanField, DateTimeField
from datetime import datetime

class Media(Document):
    user_id = ReferenceField('User', required=True)
    media_id = StringField(required=True)
    media_type = StringField(required=True, choices=["IMAGE", "VIDEO"])
    media_url = ListField(StringField(), required=True)
    caption = StringField()
    hashtags = ListField(StringField())
    likes = IntField(default=0)
    comments = IntField(default=0)
    created_at = DateTimeField(default=datetime.utcnow)
    processed = BooleanField(default=False)
    product = ReferenceField('Product')

    meta = {
        'collection': 'media',
        'indexes': [
            {'fields': ['user_id', 'media_id'], 'unique': True}
        ]
    } 