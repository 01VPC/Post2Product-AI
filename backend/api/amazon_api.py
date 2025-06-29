from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.amazon_service import AmazonService
from models.user import User
from models.product import Product
from datetime import datetime, timedelta

amazon_api = Blueprint('amazon_api', __name__)

@amazon_api.route('/connect', methods=['POST'])
@jwt_required()
def connect_amazon():
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or not all(k in data for k in ['seller_id', 'refresh_token']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Test Amazon connection
        amazon_service = AmazonService(data['refresh_token'])
        test_response = amazon_service.get_orders(
            created_after=(datetime.utcnow() - timedelta(days=1))
        )
        
        if 'error' in test_response:
            return jsonify({'error': 'Invalid Amazon credentials'}), 400
        
        # Update user's Amazon credentials
        user.amazon_seller_id = data['seller_id']
        user.amazon_refresh_token = data['refresh_token']
        user.amazon_connected = True
        db.session.commit()
        
        return jsonify({
            'message': 'Amazon connected successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@amazon_api.route('/listings', methods=['GET'])
@jwt_required()
def get_listings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.amazon_connected:
        return jsonify({'error': 'Amazon not connected'}), 400
    
    listings = AmazonListing.query.filter_by(user_id=user_id).all()
    return jsonify({
        'listings': [listing.to_dict() for listing in listings]
    })

@amazon_api.route('/listings', methods=['POST'])
@jwt_required()
def create_listing():
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or not all(k in data for k in ['product_id']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.get(user_id)
    if not user or not user.amazon_connected:
        return jsonify({'error': 'Amazon not connected'}), 400
    
    product = Product.query.get(data['product_id'])
    if not product or product.user_id != user_id:
        return jsonify({'error': 'Product not found'}), 404
    
    amazon_service = AmazonService(user.amazon_refresh_token)
    result = amazon_service.create_listing(product)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result), 201

@amazon_api.route('/listings/<int:listing_id>/inventory', methods=['PUT'])
@jwt_required()
def update_inventory(listing_id):
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or 'quantity' not in data:
        return jsonify({'error': 'Missing quantity'}), 400
    
    user = User.query.get(user_id)
    if not user or not user.amazon_connected:
        return jsonify({'error': 'Amazon not connected'}), 400
    
    amazon_service = AmazonService(user.amazon_refresh_token)
    result = amazon_service.update_inventory(listing_id, data['quantity'])
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result)