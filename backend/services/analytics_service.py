# services/analytics_service.py
from models.sale import Sale
from models.product import Product
from sqlalchemy import func, and_
from datetime import datetime, timedelta
import pandas as pd
from utils.database import db

class AnalyticsService:
    def __init__(self, user_id):
        self.user_id = user_id
    
    def get_sales_summary(self, days=30):
        """Get a summary of sales for the given period"""
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Query sales data
        sales = Sale.query.filter(
            and_(
                Sale.user_id == self.user_id,
                Sale.sale_date >= start_date,
                # services/analytics_service.py (continued)
                Sale.sale_date <= end_date
            )
        ).all()
        
        # Convert to DataFrame for easier analysis
        sales_df = pd.DataFrame([s.to_dict() for s in sales])
        
        if sales_df.empty:
            return {
                'total_sales': 0,
                'total_revenue': 0,
                'platform_breakdown': {
                    'amazon': 0,
                    'instagram': 0
                },
                'product_breakdown': []
            }
        
        # Calculate total sales and revenue
        total_sales = sales_df['quantity'].sum()
        total_revenue = (sales_df['quantity'] * sales_df['sale_price']).sum()
        
        # Platform breakdown
        platform_breakdown = sales_df.groupby('platform')['quantity'].sum().to_dict()
        for platform in ['amazon', 'instagram']:
            if platform not in platform_breakdown:
                platform_breakdown[platform] = 0
        
        # Product breakdown
        product_breakdown = []
        if 'product_id' in sales_df.columns:
            product_sales = sales_df.groupby('product_id').agg({
                'quantity': 'sum',
                'sale_price': lambda x: (x * sales_df.loc[x.index, 'quantity']).sum()
            }).reset_index()
            
            for _, row in product_sales.iterrows():
                product = Product.query.get(row['product_id'])
                if product:
                    product_breakdown.append({
                        'product_id': product.id,
                        'title': product.title,
                        'sales': int(row['quantity']),
                        'revenue': float(row['sale_price'])
                    })
        
        return {
            'total_sales': int(total_sales),
            'total_revenue': float(total_revenue),
            'platform_breakdown': platform_breakdown,
            'product_breakdown': product_breakdown
        }
    
    def get_sales_by_date(self, days=30):
        """Get sales data grouped by date"""
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Query sales data
        sales = db.session.query(
            func.date(Sale.sale_date).label('date'),
            func.sum(Sale.quantity).label('quantity'),
            func.sum(Sale.quantity * Sale.sale_price).label('revenue'),
            Sale.platform
        ).filter(
            and_(
                Sale.user_id == self.user_id,
                Sale.sale_date >= start_date,
                Sale.sale_date <= end_date
            )
        ).group_by(func.date(Sale.sale_date), Sale.platform).all()
        
        # Format results
        result = {}
        for date, quantity, revenue, platform in sales:
            date_str = date.strftime('%Y-%m-%d')
            if date_str not in result:
                result[date_str] = {
                    'date': date_str,
                    'amazon': {'quantity': 0, 'revenue': 0},
                    'instagram': {'quantity': 0, 'revenue': 0},
                    'total': {'quantity': 0, 'revenue': 0}
                }
            
            result[date_str][platform] = {
                'quantity': int(quantity),
                'revenue': float(revenue)
            }
            
            result[date_str]['total']['quantity'] += int(quantity)
            result[date_str]['total']['revenue'] += float(revenue)
        
        # Convert to list and sort by date
        result_list = list(result.values())
        result_list.sort(key=lambda x: x['date'])
        
        return result_list
    
    def get_inventory_summary(self):
        """Get inventory summary for all products"""
        products = Product.query.filter_by(user_id=self.user_id).all()
        
        total_inventory = sum(p.inventory_count for p in products)
        low_inventory = [p.to_dict() for p in products if p.inventory_count < 5]
        
        inventory_by_product = [
            {
                'product_id': p.id,
                'title': p.title,
                'inventory': p.inventory_count,
                'amazon_listed': bool(p.amazon_listing_id)
            }
            for p in products
        ]
        
        return {
            'total_inventory': total_inventory,
            'low_inventory_count': len(low_inventory),
            'low_inventory_products': low_inventory,
            'inventory_by_product': inventory_by_product
        }