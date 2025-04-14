# api/dashboard_api.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.product import Product
from models.post import InstagramPost
from models.user import User
from services.analytics_service import AnalyticsService
# from services.post_processor import PostProcessor
from services.listing_generator import ListingGenerator
from api.instagram_api import InstagramAPI
from api.amazon_api import AmazonAPI
from utils.database import db

dashboard_api = Blueprint('dashboard_api', __name__)

@dashboard_api.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """Get dashboard summary data"""
    user_id = get_jwt_identity()
    
    # Get analytics service
    analytics = AnalyticsService(user_id)
    
    # Get time range from request
    days = request.args.get('days', 30, type=int)
    
    # Get sales summary
    sales_summary = analytics.get_sales_summary(days)
    
    # Get inventory summary
    inventory_summary = analytics.get_inventory_summary()
    
    # Get user
    user = User.query.get(user_id)
    
    # Get unprocessed posts count
    unprocessed_posts_count = InstagramPost.query.filter_by(
        user_id=user_id, processed=False
    ).count()
    
    return jsonify({
        'sales': sales_summary,
        'inventory': inventory_summary,
        'instagram_connected': user.instagram_connected,
        'amazon_connected': user.amazon_connected,
        'unprocessed_posts': unprocessed_posts_count
    })

@dashboard_api.route('/sales/timeline', methods=['GET'])
@jwt_required()
def get_sales_timeline():
    """Get sales timeline data"""
    user_id = get_jwt_identity()
    
    # Get analytics service
    analytics = AnalyticsService(user_id)
    
    # Get time range from request
    days = request.args.get('days', 30, type=int)
    
    # Get sales by date
    sales_by_date = analytics.get_sales_by_date(days)
    
    return jsonify({
        'sales_timeline': sales_by_date
    })

@dashboard_api.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products"""
    user_id = get_jwt_identity()
    
    # Get products
    products = Product.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'products': [p.to_dict() for p in products]
    })

@dashboard_api.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get a specific product"""
    user_id = get_jwt_identity()
    
    # Get product
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'product': product.to_dict()
    })

@dashboard_api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product"""
    user_id = get_jwt_identity()
    
    # Get product
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Update fields
    data = request.json
    
    if 'title' in data:
        product.title = data['title']
    
    if 'description' in data:
        product.description = data['description']
    
    if 'price' in data:
        product.price = data['price']
    
    if 'inventory_count' in data:
        product.inventory_count = data['inventory_count']
    
    db.session.commit()
    
    # If this product is listed on Amazon, update the listing
    if product.amazon_listing_id and 'update_amazon' in data and data['update_amazon']:
        amazon_api = AmazonAPI()
        amazon_api.create_product_listing(product)
    
    return jsonify({
        'product': product.to_dict()
    })

@dashboard_api.route('/products/<int:product_id>/publish-to-amazon', methods=['POST'])
@jwt_required()
def publish_to_amazon(product_id):
    """Publish a product to Amazon"""
    user_id = get_jwt_identity()
    
    # Get product
    product = Product.query.filter_by(id=product_id, user_id=user_id).first()
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check if user has connected Amazon
    user = User.query.get(user_id)
    
    if not user.amazon_connected:
        return jsonify({'error': 'Amazon account not connected'}), 400
    
    # Publish to Amazon
    amazon_api = AmazonAPI()
    result = amazon_api.create_product_listing(product)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    # Update product with feed ID
    listing_generator = ListingGenerator()
    listing_generator.update_amazon_listing(product, amazon_listing_id=result['feed_id'])
    
    return jsonify({
        'status': 'success',
        'message': 'Product published to Amazon',
        'feed_id': result['feed_id']
    })

@dashboard_api.route('/instagram/posts', methods=['GET'])
@jwt_required()
def get_instagram_posts():
    """Get Instagram posts"""
    user_id = get_jwt_identity()
    
    # Get processed parameter
    processed = request.args.get('processed', None)
    
    # Build query
    query = InstagramPost.query.filter_by(user_id=user_id)
    
    if processed is not None:
        processed = processed.lower() == 'true'
        query = query.filter_by(processed=processed)
    
    # Get posts
    posts = query.order_by(InstagramPost.timestamp.desc()).all()
    
    return jsonify({
        'posts': [p.to_dict() for p in posts]
    })

@dashboard_api.route('/instagram/posts/<int:post_id>/generate-product', methods=['POST'])
@jwt_required()
def generate_product_from_post(post_id):
    """Generate a product from an Instagram post"""
    user_id = get_jwt_identity()
    
    # Get post
    post = InstagramPost.query.filter_by(id=post_id, user_id=user_id).first()
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    if post.processed:
        return jsonify({'error': 'Post already processed'}), 400
    
    # Generate product
    listing_generator = ListingGenerator()
    product = listing_generator.generate_amazon_listing_from_post(post, user_id)
    
    return jsonify({
        'status': 'success',
        'message': 'Product generated from post',
        'product': product.to_dict()
    })

@dashboard_api.route('/instagram/sync', methods=['POST'])
@jwt_required()
def sync_instagram_posts():
    """Sync Instagram posts"""
    user_id = get_jwt_identity()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user.instagram_connected or not user.instagram_access_token:
        return jsonify({'error': 'Instagram account not connected'}), 400
    
    # Sync posts
    instagram_api = InstagramAPI()
    posts = instagram_api.fetch_and_store_posts(user_id, user.instagram_access_token)
    
    return jsonify({
        'status': 'success',
        'message': f'Synced {len(posts)} new posts'
    })

@dashboard_api.route('/amazon/sync-sales', methods=['POST'])
@jwt_required()
def sync_amazon_sales():
    """Sync Amazon sales"""
    user_id = get_jwt_identity()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user.amazon_connected:
        return jsonify({'error': 'Amazon account not connected'}), 400
    
    # Sync sales
    amazon_api = AmazonAPI()
    result = amazon_api.sync_sales(user_id)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify({
        'status': 'success',
        'message': f'Synced {result["synced_sales"]} new sales'
    })