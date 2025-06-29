from utils.database import db
from datetime import datetime

class InstagramPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    instagram_post_id = db.Column(db.String(100), unique=True, nullable=False)
    caption = db.Column(db.Text)
    media_url = db.Column(db.String(500))
    permalink = db.Column(db.String(500))
    posted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Product tagging
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'instagram_post_id': self.instagram_post_id,
            'caption': self.caption,
            'media_url': self.media_url,
            'permalink': self.permalink,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'product_id': self.product_id
        }