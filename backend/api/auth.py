from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status_code = AuthService.register_user(
        data['username'], 
        data['email'], 
        data['password']
    )
    
    return jsonify(result), status_code

@auth_api.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not all(k in data for k in ['username_or_email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status_code = AuthService.login_user(
        data['username_or_email'],
        data['password']
    )
    
    return jsonify(result), status_code

@auth_api.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()})