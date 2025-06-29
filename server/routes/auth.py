from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
import logging

# Set up logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
            
        # Check if user already exists
        if User.objects(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user with hashed password
        user = User(
            email=data['email'],
            password=generate_password_hash(data['password'], method='pbkdf2:sha256'),
            name=data.get('name', '')
        )
        user.save()
        
        return jsonify({'message': 'User registered successfully'}), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        logger.debug("Login attempt started")
        data = request.get_json()
        logger.debug(f"Login data received: {data}")
        
        # Validate required fields
        if not data or 'email' not in data or 'password' not in data:
            logger.warning("Missing email or password in login request")
            return jsonify({'error': 'Email and password are required'}), 400
            
        # Find user by email
        user = User.objects(email=data['email']).first()
        if not user:
            logger.warning(f"No user found with email: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
            
        logger.debug(f"User found: {user.email}")
        
        # Verify password
        try:
            is_valid = check_password_hash(user.password, data['password'])
            logger.debug(f"Password verification result: {is_valid}")
            
            if not is_valid:
                logger.warning("Invalid password")
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            return jsonify({'error': 'Error verifying credentials'}), 500
        
        # Generate access token
        try:
            access_token = create_access_token(identity=str(user.id))
            if isinstance(access_token, bytes):
                access_token = access_token.decode('utf-8')
            logger.debug("Access token generated successfully")
            
            # Create user data object
            user_data = {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'instagram_connected': user.instagram_connected,
                'amazon_connected': user.amazon_connected
            }
            
            response_data = {
                'success': True,
                'token': access_token,
                'user': user_data
            }
            
            logger.debug("Login successful")
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"Token generation error: {str(e)}")
            return jsonify({'error': 'Error generating access token'}), 500
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.objects.get(id=user_id)
        
        return jsonify({
            'success': True,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'instagram_connected': user.instagram_connected,
                'amazon_connected': user.amazon_connected,
                'instagram_username': user.instagram_username,
                'amazon_seller_id': user.amazon_seller_id
            }
        })
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return jsonify({'error': 'Error getting user information'}), 500

@auth_bp.route('/profile', methods=['GET']) 
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.objects.get(id=user_id)
        
        return jsonify({
            'id': str(user.id),
            'email': user.email,
            'name': user.name,
            'instagram_connected': user.instagram_connected,
            'amazon_connected': user.amazon_connected,
            'instagram_username': user.instagram_username,
            'amazon_seller_id': user.amazon_seller_id
        })
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': str(e)}), 500 