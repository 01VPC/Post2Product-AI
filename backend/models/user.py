from utils.database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Instagram Integration
    instagram_user_id = db.Column(db.String(120))
    instagram_access_token = db.Column(db.String(500))
    instagram_connected = db.Column(db.Boolean, default=False)
    
    # Amazon Integration
    amazon_seller_id = db.Column(db.String(120))
    amazon_marketplace_id = db.Column(db.String(120))
    amazon_refresh_token = db.Column(db.String(500))
    amazon_connected = db.Column(db.Boolean, default=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'instagram_connected': self.instagram_connected,
            'amazon_connected': self.amazon_connected,
            'created_at': self.created_at.isoformat()
        }