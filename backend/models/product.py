from utils.database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('instagram_posts.id'), nullable=True)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    sku = db.Column(db.String(64), unique=True)
    amazon_listing_id = db.Column(db.String(64))
    amazon_asin = db.Column(db.String(10))
    inventory_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref='products')
    sales = db.relationship('Sale', backref='product')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'sku': self.sku,
            'amazon_listing_id': self.amazon_listing_id,
            'amazon_asin': self.amazon_asin,
            'inventory_count': self.inventory_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
