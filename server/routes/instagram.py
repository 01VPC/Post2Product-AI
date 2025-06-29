from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
import requests
import os

instagram_bp = Blueprint('instagram', __name__)

@instagram_bp.route('/connect', methods=['POST'])
@jwt_required()
def connect_instagram():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = User.objects.get(id=user_id)
        user.instagram_username = data.get('username')
        user.instagram_access_token = data.get('access_token')
        user.instagram_connected = True
        user.save()
        
        return jsonify({'message': 'Instagram account connected successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@instagram_bp.route('/post', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = User.objects.get(id=user_id)
        if not user.instagram_connected:
            return jsonify({'error': 'Instagram account not connected'}), 400
            
        product = Product.objects.get(id=data['product_id'])
        
        # Create Instagram post using product data
        post_data = {
            'caption': f"{product.title}\n\nPrice: ${product.price}\n\n{product.description}",
            'image_url': product.image_urls[0] if product.image_urls else None
        }
        
        # Here you would make the actual API call to Instagram
        # This is a placeholder for the Instagram API integration
        response = create_instagram_post(user.instagram_access_token, post_data)
        
        if response.get('id'):
            # Update product with Instagram post ID
            product.instagram_post_ids.append(response['id'])
            product.save()
            
        return jsonify({'message': 'Post created successfully', 'post_id': response.get('id')})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@instagram_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        if not user.instagram_connected:
            return jsonify({'error': 'Instagram account not connected'}), 400
            
        products = Product.objects(user=user, instagram_post_ids__exists=True)
        
        posts = []
        for product in products:
            for post_id in product.instagram_post_ids:
                # Here you would fetch actual post data from Instagram API
                post_data = get_instagram_post(user.instagram_access_token, post_id)
                if post_data:
                    posts.append({
                        'post_id': post_id,
                        'product_id': str(product.id),
                        'product_title': product.title,
                        'engagement': post_data.get('engagement', {})
                    })
        
        return jsonify(posts)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def create_instagram_post(access_token, post_data):
    # Placeholder for Instagram API integration
    # This would be replaced with actual Instagram API calls
    return {'id': 'mock_post_id'}

def get_instagram_post(access_token, post_id):
    # Placeholder for Instagram API integration
    # This would be replaced with actual Instagram API calls
    return {
        'engagement': {
            'likes': 0,
            'comments': 0,
            'shares': 0
        }
    } 