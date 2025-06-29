from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.instagram_service import InstagramService
from models.user import User

instagram_api = Blueprint('instagram_api', __name__)

@instagram_api.route('/auth-url', methods=['GET'])
@jwt_required()
def get_auth_url():
    instagram_service = InstagramService()
    auth_url = instagram_service.get_auth_url()
    return jsonify({'auth_url': auth_url})

@instagram_api.route('/callback', methods=['GET'])
def instagram_callback():
    code = request.args.get('code')
    state = request.args.get('state')  # This should be the user's JWT
    
    if not code:
        return jsonify({'error': 'Missing authorization code'}), 400
    
    try:
        instagram_service = InstagramService()
        token_data = instagram_service.exchange_code_for_token(code)
        
        if 'error' in token_data:
            return jsonify({'error': token_data['error_message']}), 400
        
        # Get user from state (JWT)
        user_id = get_jwt_identity(state)
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user's Instagram credentials
        user.instagram_access_token = token_data['access_token']
        user.instagram_connected = True
        
        # Get user profile
        instagram_service = InstagramService(token_data['access_token'])
        profile = instagram_service.get_user_profile()
        user.instagram_user_id = profile['id']
        
        db.session.commit()
        
        # Sync initial posts
        instagram_service.sync_posts(user.id)
        
        return jsonify({
            'message': 'Instagram connected successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@instagram_api.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.instagram_connected:
        return jsonify({'error': 'Instagram not connected'}), 400
    
    instagram_service = InstagramService(user.instagram_access_token)
    posts = instagram_service.get_user_posts()
    
    return jsonify({'posts': posts})