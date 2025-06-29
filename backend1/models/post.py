from utils.database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class InstagramPost(db.Model):
    __tablename__ = 'instagram_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    instagram_post_id = db.Column(db.String(64), unique=True, nullable=False)
    caption = db.Column(db.Text)
    media_url = db.Column(db.String(256))
    permalink = db.Column(db.String(256))
    timestamp = db.Column(db.DateTime)
    processed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='posts')
    product = db.relationship('Product', backref='post', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'instagram_post_id': self.instagram_post_id,
            'caption': self.caption,
            'media_url': self.media_url,
            'permalink': self.permalink,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'processed': self.processed,
            'created_at': self.created_at.isoformat()
        }
