# app.py
from flask import Flask, jsonify, request, redirect, url_for
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from utils.database import init_db
from config import Config
from api.instagram_api import InstagramAPI
from api.amazon_api import AmazonAPI
from api.dashboard_api import dashboard_api
from services.auth_service import AuthService
from models.user import User
import os

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
jwt = JWTManager(app)
CORS(app)

# Initialize database
db = init_db(app)

# Register blueprints
app.register_blueprint(dashboard_api, url_prefix='/api/dashboard')

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    if not data or not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status_code = AuthService.register_user(
        data['username'], data['email'], data['password']
    )
    
    return jsonify(result), status_code

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.json
    
    if not data or not all(k in data for k in ['username_or_email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status_code = AuthService.login_user(
        data['username_or_email'], data['password']
    )
    
    return jsonify(result), status_code

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    
    result, status_code = AuthService.refresh_token(user_id)
    
    return jsonify(result), status_code

@app.route('/api/auth/user', methods=['GET'])
@jwt_required()
def get_user():
    """Get current user"""
    user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()})

@app.route('/api/auth/user', methods=['PUT'])
@jwt_required()
def update_user():
    """Update user information"""
    user_id = get_jwt_identity()
    data = request.json
    
    result, status_code = AuthService.update_user(user_id, data)
    
    return jsonify(result), status_code

# Instagram connection routes
@app.route('/api/instagram/auth-url', methods=['GET'])
@jwt_required()
def get_instagram_auth_url():
    """Get Instagram authentication URL"""
    instagram_api = InstagramAPI()
    auth_url = instagram_api.get_auth_url()
    
    return jsonify({'auth_url': auth_url})

@app.route('/api/instagram/callback', methods=['GET'])
def instagram_callback():
    """Instagram OAuth callback"""
    code = request.args.get('code')
    
    if not code:
        return redirect('/connect-instagram?error=missing_code')
    
    try:
        # Exchange code for token
        instagram_api = InstagramAPI()
        token_data = instagram_api.exchange_code_for_token(code)
        
        # Get user from session or cookies (client should send token)
        access_token = request.args.get('state')
        if not access_token:
            return redirect('/connect-instagram?error=missing_state')
        
        # Validate token and get user ID
        user_id = get_jwt_identity(access_token)
        user = User.query.get(user_id)
        
        if not user:
            return redirect('/connect-instagram?error=invalid_user')
        
        # Get user profile
        profile = instagram_api.get_user_profile(token_data['access_token'])
        
        # Update user
        user.instagram_connected = True
        user.instagram_access_token = token_data['access_token']
        user.instagram_user_id = profile['id']
        db.session.commit()
        
        # Fetch initial posts
        instagram_api.fetch_and_store_posts(user.id, token_data['access_token'])
        
        return redirect('/dashboard?instagram_connected=true')
    except Exception as e:
        return redirect(f'/connect-instagram?error={str(e)}')

# Amazon connection routes
@app.route('/api/amazon/connect', methods=['POST'])
@jwt_required()
def connect_amazon():
    """Connect Amazon account"""
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or not all(k in data for k in ['seller_id', 'marketplace_id', 'refresh_token']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Update user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Test connection
    try:
        amazon_api = AmazonAPI(
            seller_id=data['seller_id'],
            marketplace_id=data['marketplace_id'],
            refresh_token=data['refresh_token']
        )
        
        # Try to get inventory to test connection
        inventory = amazon_api.get_inventory()
        
        if 'error' in inventory:
            return jsonify({'error': inventory['error']}), 400
        
        # Connection successful, update user
        user.amazon_connected = True
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Amazon account connected successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)