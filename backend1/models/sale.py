from utils.database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    platform = db.Column(db.String(20), nullable=False)  # 'instagram' or 'amazon'
    quantity = db.Column(db.Integer, default=1)
    sale_price = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.String(64))
    sale_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='sales')
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'platform': self.platform,
            'quantity': self.quantity,
            'sale_price': self.sale_price,
            'order_id': self.order_id,
            'sale_date': self.sale_date.isoformat()
        }