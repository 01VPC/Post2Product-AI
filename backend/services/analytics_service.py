from models.product import Product
from models.instagram_post import InstagramPost
from models.amazon_listing import AmazonListing
from sqlalchemy import func
from datetime import datetime, timedelta

class AnalyticsService:
    @staticmethod
    def get_dashboard_stats(user_id):
        # Get total products
        total_products = Product.query.filter_by(user_id=user_id).count()
        
        # Get total Instagram posts
        total_posts = InstagramPost.query.filter_by(user_id=user_id).count()
        
        # Get total Amazon listings
        total_listings = AmazonListing.query.filter_by(user_id=user_id).count()
        
        # Get product distribution
        products_with_listings = (
            Product.query
            .filter_by(user_id=user_id)
            .filter(Product.amazon_asin.isnot(None))
            .count()
        )
        
        return {
            'total_products': total_products,
            'total_posts': total_posts,
            'total_listings': total_listings,
            'products_with_listings': products_with_listings
        }
    
    @staticmethod
    def get_sales_analytics(user_id, days=30):
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get daily sales data
        sales_data = (
            db.session.query(
                func.date(AmazonListing.updated_at).label('date'),
                func.sum(AmazonListing.price).label('revenue')
            )
            .filter(
                AmazonListing.user_id == user_id,
                AmazonListing.updated_at >= start_date
            )
            .group_by(func.date(AmazonListing.updated_at))
            .all()
        )
        
        return [{
            'date': data.date.strftime('%Y-%m-%d'),
            'revenue': float(data.revenue)
        } for data in sales_data]