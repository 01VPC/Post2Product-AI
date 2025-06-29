import requests
from models.instagram_post import InstagramPost
from utils.database import db
from flask import current_app
from datetime import datetime

class InstagramService:
    BASE_URL = "https://graph.instagram.com"
    
    def __init__(self, access_token=None):
        self.access_token = access_token
    
    def get_auth_url(self):
        return f"https://api.instagram.com/oauth/authorize?client_id={current_app.config['INSTAGRAM_CLIENT_ID']}&redirect_uri={current_app.config['INSTAGRAM_REDIRECT_URI']}&scope=user_profile,user_media&response_type=code"
    
    def exchange_code_for_token(self, code):
        response = requests.post(
            "https://api.instagram.com/oauth/access_token",
            data={
                "client_id": current_app.config['INSTAGRAM_CLIENT_ID'],
                "client_secret": current_app.config['INSTAGRAM_CLIENT_SECRET'],
                "grant_type": "authorization_code",
                "redirect_uri": current_app.config['INSTAGRAM_REDIRECT_URI'],
                "code": code
            }
        )
        return response.json()
    
    def get_user_profile(self):
        response = requests.get(
            f"{self.BASE_URL}/me",
            params={
                "fields": "id,username",
                "access_token": self.access_token
            }
        )
        return response.json()
    
    def get_user_posts(self):
        response = requests.get(
            f"{self.BASE_URL}/me/media",
            params={
                "fields": "id,caption,media_type,media_url,permalink,timestamp",
                "access_token": self.access_token
            }
        )
        return response.json()
    
    def sync_posts(self, user_id):
        posts = self.get_user_posts()
        synced_posts = []
        
        for post in posts.get("data", []):
            existing_post = InstagramPost.query.filter_by(
                instagram_post_id=post["id"]
            ).first()
            
            if not existing_post:
                new_post = InstagramPost(
                    user_id=user_id,
                    instagram_post_id=post["id"],
                    caption=post.get("caption"),
                    media_url=post.get("media_url"),
                    permalink=post.get("permalink"),
                    posted_at=datetime.strptime(
                        post.get("timestamp"), 
                        "%Y-%m-%dT%H:%M:%S+0000"
                    )
                )
                db.session.add(new_post)
                synced_posts.append(new_post)
        
        db.session.commit()
        return synced_posts