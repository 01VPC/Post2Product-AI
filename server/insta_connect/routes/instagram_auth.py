from flask import Blueprint, request, jsonify
import requests
from datetime import datetime, timedelta
from models.user import User
import os
from dotenv import load_dotenv

load_dotenv()

instagram_auth = Blueprint('instagram_auth', __name__)

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI")
API_VERSION = "v20.0"
SCOPES = "instagram_basic,pages_show_list,business_management"

@instagram_auth.route('/initiate', methods=['GET'])
def facebook_initiate():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    auth_url = (
        f"https://www.facebook.com/{API_VERSION}/dialog/oauth"
        f"?client_id={FACEBOOK_CLIENT_ID}"
        f"&redirect_uri={FACEBOOK_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={SCOPES}"
        f"&state={email}"
    )
    return jsonify({"authorization_url": auth_url}), 200

@instagram_auth.route('/callback', methods=['GET'])
def facebook_callback():
    try:
        code = request.args.get('code')
        email = request.args.get('state')
        if not code or not email:
            return jsonify({"error": "Missing code or state parameter"}), 400

        user = User.objects(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Step 1: Exchange code for short-lived token
        token_response = requests.get(
            f"https://graph.facebook.com/{API_VERSION}/oauth/access_token",
            params={
                "client_id": FACEBOOK_CLIENT_ID,
                "client_secret": FACEBOOK_CLIENT_SECRET,
                "redirect_uri": FACEBOOK_REDIRECT_URI,
                "code": code
            }
        )
        if token_response.status_code != 200:
            return jsonify({"error": "Token exchange failed", "details": token_response.json()}), 400

        token_data = token_response.json()
        user_access_token = token_data['access_token']

        # Step 2: Get user's pages
        pages_response = requests.get(
            f"https://graph.facebook.com/{API_VERSION}/me/accounts",
            params={"access_token": user_access_token}
        )
        if pages_response.status_code != 200:
            return jsonify({"error": "Failed to fetch pages", "details": pages_response.json()}), 400

        pages_data = pages_response.json().get('data', [])
        if not pages_data:
            return jsonify({"error": "No Facebook pages found"}), 400

        # Step 3: Find first page with Instagram connection
        valid_page = None
        for page in pages_data:
            page_id = page['id']
            page_token = page['access_token']
            ig_response = requests.get(
                f"https://graph.facebook.com/{API_VERSION}/{page_id}",
                params={
                    "fields": "instagram_business_account",
                    "access_token": page_token
                }
            )
            if ig_response.status_code == 200:
                ig_account = ig_response.json().get('instagram_business_account')
                if ig_account:
                    valid_page = {
                        "page_id": page_id,
                        "page_token": page_token,
                        "ig_id": ig_account['id']
                    }
                    break

        if not valid_page:
            return jsonify({"error": "No linked Instagram account found"}), 400

        # Step 4: Get long-lived token
        long_token_response = requests.get(
            f"https://graph.facebook.com/{API_VERSION}/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": FACEBOOK_CLIENT_ID,
                "client_secret": FACEBOOK_CLIENT_SECRET,
                "fb_exchange_token": valid_page['page_token']
            }
        )
        if long_token_response.status_code != 200:
            return jsonify({"error": "Failed to get long-lived token", "details": long_token_response.json()}), 400

        long_token_data = long_token_response.json()
        long_lived_token = long_token_data['access_token']
        expires_in = long_token_data.get('expires_in', 5184000)  # 60 days

        # Step 5: Get Instagram username
        ig_user_id = valid_page['ig_id']
        ig_profile_response = requests.get(
            f"https://graph.facebook.com/{API_VERSION}/{ig_user_id}",
            params={
                "fields": "username",
                "access_token": long_lived_token
            }
        )
        ig_username = None
        if ig_profile_response.status_code == 200:
            ig_username = ig_profile_response.json().get('username')

        # Step 6: Update user document
        user.instagram_connected = True
        user.instagram_access_token = long_lived_token
        user.instagram_id = ig_user_id
        user.instagram_username = ig_username
        user.save()

        return jsonify({
            "message": "Instagram connection successful",
            "instagram_id": ig_user_id,
            "instagram_username": ig_username,
            "expires_in_days": expires_in // 86400
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@instagram_auth.route('/media', methods=['GET'])
def get_media():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email required"}), 400

        user = User.objects(email=email).first()
        if not user or not user.instagram_connected:
            return jsonify({"error": "Instagram not connected"}), 400

        media_response = requests.get(
            f"https://graph.facebook.com/{API_VERSION}/{user.instagram_id}/media",
            params={
                "access_token": user.instagram_access_token,
                "fields": "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
            }
        )
        if media_response.status_code != 200:
            return jsonify({"error": "Failed to fetch media", "details": media_response.json()}), 400

        return jsonify(media_response.json()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@instagram_auth.route('/disconnect', methods=['POST'])
def disconnect_instagram():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = User.objects(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.instagram_connected = False
    user.instagram_access_token = None
    user.instagram_id = None
    user.instagram_username = None
    user.save()
    return jsonify({'message': 'Instagram disconnected'}), 200 