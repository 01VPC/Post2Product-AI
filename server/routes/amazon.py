from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
from models.sale import Sale
import boto3
import os

amazon_bp = Blueprint('amazon', __name__)

@amazon_bp.route('/connect', methods=['POST'])
@jwt_required()
def connect_amazon():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = User.objects.get(id=user_id)
        user.amazon_seller_id = data.get('seller_id')
        user.amazon_access_key = data.get('access_key')
        user.amazon_secret_key = data.get('secret_key')
        user.amazon_connected = True
        user.save()
        
        return jsonify({'message': 'Amazon account connected successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@amazon_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_products():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        if not user.amazon_connected:
            return jsonify({'error': 'Amazon account not connected'}), 400
        
        # Initialize Amazon SP-API client
        client = get_amazon_client(user)
        
        # Fetch products from Amazon
        amazon_products = get_amazon_products(client)
        
        # Update local database
        for product_data in amazon_products:
            product = Product.objects(user=user, asin=product_data['asin']).first()
            
            if product:
                # Update existing product
                product.update(
                    title=product_data['title'],
                    price=product_data['price'],
                    description=product_data.get('description', ''),
                    category=product_data.get('category', ''),
                    brand=product_data.get('brand', ''),
                    image_urls=product_data.get('image_urls', []),
                    stock=product_data.get('stock', 0)
                )
            else:
                # Create new product
                product = Product(
                    user=user,
                    asin=product_data['asin'],
                    title=product_data['title'],
                    price=product_data['price'],
                    description=product_data.get('description', ''),
                    category=product_data.get('category', ''),
                    brand=product_data.get('brand', ''),
                    image_urls=product_data.get('image_urls', []),
                    stock=product_data.get('stock', 0)
                )
                product.save()
        
        return jsonify({'message': 'Products synced successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@amazon_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    
    try:
        user = User.objects.get(id=user_id)
        if not user.amazon_connected:
            return jsonify({'error': 'Amazon account not connected'}), 400
        
        # Initialize Amazon SP-API client
        client = get_amazon_client(user)
        
        # Fetch orders from Amazon
        amazon_orders = get_amazon_orders(client)
        
        # Update local database with orders
        for order_data in amazon_orders:
            sale = Sale.objects(user=user, order_id=order_data['order_id']).first()
            
            if not sale:
                product = Product.objects(user=user, asin=order_data['asin']).first()
                if product:
                    sale = Sale(
                        user=user,
                        product=product,
                        quantity=order_data['quantity'],
                        price_per_unit=order_data['price'],
                        total_amount=order_data['price'] * order_data['quantity'],
                        order_id=order_data['order_id'],
                        status=order_data['status']
                    )
                    sale.save()
        
        return jsonify({'message': 'Orders synced successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_amazon_client(user):
    # Placeholder for Amazon SP-API client initialization
    # This would be replaced with actual Amazon SP-API integration
    return None

def get_amazon_products(client):
    # Placeholder for Amazon SP-API product fetching
    # This would be replaced with actual Amazon SP-API calls
    return []

def get_amazon_orders(client):
    # Placeholder for Amazon SP-API order fetching
    # This would be replaced with actual Amazon SP-API calls
    return [] 