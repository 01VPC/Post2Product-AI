import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # MongoDB settings
    MONGODB_URI = os.getenv('MONGODB_URI')
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET')
    
    # Other settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

    @classmethod
    def validate(cls):
        """Validate that all required configuration is present"""
        if not cls.MONGODB_URI:
            raise ValueError("MONGODB_URI must be set in environment variables")
        if not cls.JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY must be set in environment variables") 