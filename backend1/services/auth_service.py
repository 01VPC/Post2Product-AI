# services/auth_service.py
from models.user import User
from utils.database import db
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash
import datetime

class AuthService:
    @staticmethod
    def register_user(username, email, password):
        """Register a new user"""
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                return {'error': 'Username already exists'}, 400
            else:
                return {'error': 'Email already exists'}, 400
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 201
    
    @staticmethod
    def login_user(username_or_email, password):
        """Login a user"""
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not user.check_password(password):
            return {'error': 'Invalid credentials'}, 401
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200
    
    @staticmethod
    def refresh_token(user_id):
        """Refresh access token"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        access_token = create_access_token(identity=user.id)
        
        return {
            'access_token': access_token
        }, 200
    
    @staticmethod
    def update_user(user_id, data):
        """Update user information"""
        user = User.query.get(user_id)
        
        if not user:
            return {'error': 'User not found'}, 404
        
        # Update fields
        if 'username' in data:
            # Check if username already exists
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return {'error': 'Username already exists'}, 400
            user.username = data['username']
            
        if 'email' in data:
            # Check if email already exists
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email already exists'}, 400
            user.email = data['email']
            
        if 'password' in data:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return {'user': user.to_dict()}, 200