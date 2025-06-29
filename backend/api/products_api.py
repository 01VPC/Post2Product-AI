from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.product import Product
from utils.database import db

products_api = Blueprint('products_api', __name__)

@products_api.route('', methods=['GET'])
@jwt_required()
def get_products():
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=user_id).all()
    return jsonify({
        'products': [product.to_dict() for product in products]
    })

@products_api.route('', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or not all(k in data for k in ['name', 'price', 'sku']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = Product(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        stock=data.get('stock', 0),
        sku=data['sku']
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'product': product.to_dict()}), 201

@products_api.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = get_jwt_identity()
    data = request.json
    
    product = Product.query.get(product_id)
    if not product or product.user_id != user_id:
        return jsonify({'error': 'Product not found'}), 404
    
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'stock' in data:
        product.stock = data['stock']
    if 'sku' in data:
        product.sku = data['sku']
    
    db.session.commit()
    
    return jsonify({'product': product.to_dict()})

@products_api.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    
    product = Product.query.get(product_id)
    if not product or product.user_id != user_id:
        return jsonify({'error': 'Product not found'}), 404
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'})