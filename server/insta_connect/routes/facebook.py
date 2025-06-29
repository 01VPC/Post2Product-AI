from flask import Blueprint, request, jsonify
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database.db import db

load_dotenv()

facebook_bp = Blueprint('facebook', __name__)

# Constants
FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI")
API_VERSION = "v20.0"

SCOPES = "instagram_basic,pages_show_list,business_management"

# Helper functions
def get_short_lived_token(code):
    response = requests.get(
        f"https://graph.facebook.com/{API_VERSION}/oauth/access_token",
        params={
            "client_id": FACEBOOK_CLIENT_ID,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "redirect_uri": FACEBOOK_REDIRECT_URI,
            "code": code
        }
    )
    return response

def get_long_lived_token(short_lived_token):
    response = requests.get(
        f"https://graph.facebook.com/{API_VERSION}/oauth/access_token",
        params={
            "grant_type": "fb_exchange_token",
            "client_id": FACEBOOK_CLIENT_ID,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "fb_exchange_token": short_lived_token
        }
    )
    return response

def get_user_pages(access_token):
    response = requests.get(
        f"https://graph.facebook.com/{API_VERSION}/me/accounts",
        params={
            "access_token": access_token,
            "fields": "id,access_token,instagram_business_account"
        }
    )
    return response

def get_media_from_instagram(ig_user_id, access_token):
    response = requests.get(
        f"https://graph.facebook.com/{API_VERSION}/{ig_user_id}/media",
        params={
            "access_token": access_token,
            "fields": "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
        }
    )
    return response

# Flask Routes
@facebook_bp.route('/initiate', methods=['GET'])
def facebook_initiate():
    auth_url = (
        f"https://www.facebook.com/{API_VERSION}/dialog/oauth"
        f"?client_id={FACEBOOK_CLIENT_ID}"
        f"&redirect_uri={FACEBOOK_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={SCOPES}"
    )
    return jsonify({"authorization_url": auth_url}), 200

@facebook_bp.route('/callback', methods=['GET'])
def facebook_callback():
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({"error": "Authorization code required"}), 400

        # Step 1: Exchange code for short-lived token
        short_token_response = get_short_lived_token(code)
        if short_token_response.status_code != 200:
            return jsonify(short_token_response.json()), 400

        short_token_data = short_token_response.json()
        short_lived_token = short_token_data['access_token']

        # Step 2: Get user's pages and Instagram account
        pages_response = get_user_pages(short_lived_token)
        if pages_response.status_code != 200:
            return jsonify(pages_response.json()), 400

        pages_data = pages_response.json().get('data', [])
        if not pages_data:
            return jsonify({
                "error": "No Facebook Pages found. Requirements not met."
            }), 400

        valid_page = None
        for page in pages_data:
            if 'instagram_business_account' in page:
                valid_page = {
                    "page_id": page['id'],
                    "page_token": page['access_token'],
                    "ig_id": page['instagram_business_account']['id']
                }
                break

        if not valid_page:
            return jsonify({
                "error": "No linked Instagram Business account found."
            }), 400

        # Step 3: Exchange short-lived token for long-lived token
        long_token_response = get_long_lived_token(valid_page['page_token'])
        if long_token_response.status_code != 200:
            return jsonify(long_token_response.json()), 400

        long_token_data = long_token_response.json()
        long_lived_token = long_token_data['access_token']
        expires_in = long_token_data.get('expires_in', 5184000)  # default 60 days

        # Step 4: Save user info in database
        user_data = {
            "ig_user_id": valid_page['ig_id'],
            "fb_page_id": valid_page['page_id'],
            "access_token": long_lived_token,
            "expires_at": datetime.utcnow() + timedelta(seconds=expires_in),
            "last_updated": datetime.utcnow(),
            "instagram_connected": True
        }

        db.users.update_one(
            {"ig_user_id": valid_page['ig_id']},
            {"$set": user_data},
            upsert=True
        )

        # Step 5: Fetch media
        media_response = get_media_from_instagram(valid_page['ig_id'], long_lived_token)
        if media_response.status_code != 200:
            return jsonify(media_response.json()), 400

        return jsonify({
            "message": "Instagram connected successfully!",
            "instagram_id": valid_page['ig_id'],
            "expires_in_days": expires_in // 86400,
            "media": media_response.json()
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Authentication process failed",
            "details": str(e)
        }), 500

@facebook_bp.route('/media', methods=['GET'])
def get_media():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    user = db.users.find_one({"ig_user_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    media_response = get_media_from_instagram(user['ig_user_id'], user['access_token'])

    if media_response.status_code != 200:
        return jsonify({
            "error": "Failed to fetch media",
            "details": media_response.json()
        }), 400

    return jsonify(media_response.json()), 200
