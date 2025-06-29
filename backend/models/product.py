from utils.database import db
from datetime import datetime

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    sku = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Amazon specific fields
    amazon_asin = db.Column(db.String(20))
    amazon_listing_id = db.Column(db.String(100))
    amazon_price = db.Column(db.Float)
    amazon_stock = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'sku': self.sku,
            'amazon_asin': self.amazon_asin,
            'amazon_price': self.amazon_price,
            'amazon_stock': self.amazon_stock,
            'created_at': self.created_at.isoformat()
        }