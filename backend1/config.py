import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///post2product.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Instagram API credentials
    INSTAGRAM_APP_ID = os.environ.get('INSTAGRAM_APP_ID')
    INSTAGRAM_APP_SECRET = os.environ.get('INSTAGRAM_APP_SECRET')
    INSTAGRAM_REDIRECT_URI = os.environ.get('INSTAGRAM_REDIRECT_URI')
    
    # Amazon Marketplace API credentials
    AMAZON_ACCESS_KEY = os.environ.get('AMAZON_ACCESS_KEY')
    AMAZON_SECRET_KEY = os.environ.get('AMAZON_SECRET_KEY')
    AMAZON_SELLER_ID = os.environ.get('AMAZON_SELLER_ID')
    AMAZON_MARKETPLACE_ID = os.environ.get('AMAZON_MARKETPLACE_ID')
    AMAZON_REFRESH_TOKEN = os.environ.get('AMAZON_REFRESH_TOKEN')
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour