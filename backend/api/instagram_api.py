# api/instagram_api.py
import requests
from flask import current_app, url_for
import json
from datetime import datetime
from models.post import InstagramPost
from utils.database import db

class InstagramAPI:
    def __init__(self, app_id=None, app_secret=None, redirect_uri=None):
        self.app_id = app_id or current_app.config['INSTAGRAM_APP_ID']
        self.app_secret = app_secret or current_app.config['INSTAGRAM_APP_SECRET']
        self.redirect_uri = redirect_uri or current_app.config['INSTAGRAM_REDIRECT_URI']
        self.base_url = "https://graph.instagram.com/v12.0"
        
    def get_auth_url(self):
        """Get the Instagram OAuth URL"""
        return f"https://api.instagram.com/oauth/authorize?client_id={self.app_id}&redirect_uri={self.redirect_uri}&scope=user_profile,user_media&response_type=code"
    
    def exchange_code_for_token(self, code):
        """Exchange authorization code for access token"""
        url = "https://api.instagram.com/oauth/access_token"
        data = {
            'client_id': self.app_id,
            'client_secret': self.app_secret,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri,
            'code': code
        }
        
        response = requests.post(url, data=data)
        if response.status_code != 200:
            raise Exception(f"Failed to get access token: {response.text}")
        
        token_data = response.json()
        return self.exchange_short_lived_token(token_data['access_token'])
    
    def exchange_short_lived_token(self, short_lived_token):
        """Exchange short-lived token for long-lived token"""
        url = f"https://graph.instagram.com/access_token"
        params = {
            'grant_type': 'ig_exchange_token',
            'client_secret': self.app_secret,
            'access_token': short_lived_token
        }
        
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to exchange for long-lived token: {response.text}")
        
        return response.json()
    
    def get_user_profile(self, access_token):
        """Get user profile information"""
        url = f"{self.base_url}/me"
        params = {
            'fields': 'id,username',
            'access_token': access_token
        }
        
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to get user profile: {response.text}")
        
        return response.json()
    
    def get_user_media(self, access_token, limit=25):
        """Get user media"""
        url = f"{self.base_url}/me/media"
        params = {
            'fields': 'id,caption,media_type,media_url,permalink,timestamp',
            'access_token': access_token,
            'limit': limit
        }
        
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to get user media: {response.text}")
        
        return response.json()
    
    def fetch_and_store_posts(self, user_id, access_token, limit=25):
        """Fetch and store user posts"""
        media_data = self.get_user_media(access_token, limit)
        stored_posts = []
        
        for item in media_data.get('data', []):
            # Check if media type is image or carousel (we want to avoid videos for products)
            if item.get('media_type') in ['IMAGE', 'CAROUSEL_ALBUM']:
                # Check if post already exists
                existing_post = InstagramPost.query.filter_by(instagram_post_id=item['id']).first()
                
                if not existing_post:
                    # Create new post
                    post = InstagramPost(
                        user_id=user_id,
                        instagram_post_id=item['id'],
                        caption=item.get('caption', ''),
                        media_url=item.get('media_url', ''),
                        permalink=item.get('permalink', ''),
                        timestamp=datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00')) if 'timestamp' in item else None,
                        processed=False
                    )
                    db.session.add(post)
                    stored_posts.append(post)
        
        if stored_posts:
            db.session.commit()
            
        return stored_posts