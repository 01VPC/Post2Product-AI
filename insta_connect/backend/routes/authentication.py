from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from datetime import datetime, timedelta
from models.user import User
from database.db import db
import bcrypt
import re

auth_bp = Blueprint('auth', __name__)

# --- User Registration ---
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'error': 'Name, email, and password required'}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'Invalid email format'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.objects(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(
        name=name,
        email=email,
        password=hashed_pw,
        created_at=datetime.utcnow()
    )

    try:
        user.save()  # Attempt to save the user
    except Exception as e:
        return jsonify({'error': f'Error creating user: {str(e)}'}), 500  # Return a helpful error message if saving fails

    return jsonify({'message': 'User created successfully'}), 201

# --- User Login ---
@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = User.objects(email=email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user.active:
        return jsonify({'error': 'Account disabled'}), 403

    user.last_login = datetime.utcnow()
    user.save()

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
    refresh_token = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=7))
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user_id': str(user.id),
        'email': user.email,
        'name': user.name
    }), 200

# --- User Logout (JWT Blacklist) ---
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    db.token_blacklist.insert_one({
        "jti": jti,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    return jsonify({'message': 'Successfully logged out'}), 200

# --- Token Refresh ---
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_token}), 200 
