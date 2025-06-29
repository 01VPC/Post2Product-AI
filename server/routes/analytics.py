from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
from models.sale import Sale
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        
        # Get total products
        total_products = Product.objects(user=user).count()
        
        # Get total sales
        sales = Sale.objects(user=user, status='completed')
        total_sales = sum(sale.total_amount for sale in sales)
        total_orders = len(sales)
        
        # Get products with Instagram posts
        products_with_posts = Product.objects(user=user, instagram_post_ids__exists=True).count()
        
        return jsonify({
            'total_products': total_products,
            'total_sales': total_sales,
            'total_orders': total_orders,
            'products_with_posts': products_with_posts,
            'amazon_connected': user.amazon_connected,
            'instagram_connected': user.instagram_connected
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@analytics_bp.route('/sales', methods=['GET'])
@jwt_required()
def get_sales_analytics():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        
        # Get sales for the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        sales = Sale.objects(user=user, created_at__gte=thirty_days_ago)
        
        # Group sales by day
        daily_sales = {}
        for sale in sales:
            date_key = sale.created_at.strftime('%Y-%m-%d')
            if date_key in daily_sales:
                daily_sales[date_key]['amount'] += sale.total_amount
                daily_sales[date_key]['orders'] += 1
            else:
                daily_sales[date_key] = {
                    'amount': sale.total_amount,
                    'orders': 1
                }
        
        return jsonify({
            'daily_sales': daily_sales
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@analytics_bp.route('/products', methods=['GET'])
@jwt_required()
def get_product_analytics():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        products = Product.objects(user=user)
        
        product_stats = []
        for product in products:
            sales = Sale.objects(user=user, product=product, status='completed')
            total_sales = sum(sale.total_amount for sale in sales)
            total_quantity = sum(sale.quantity for sale in sales)
            
            product_stats.append({
                'id': str(product.id),
                'title': product.title,
                'asin': product.asin,
                'total_sales': total_sales,
                'total_quantity': total_quantity,
                'instagram_posts': len(product.instagram_post_ids)
            })
        
        return jsonify({
            'products': product_stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400 