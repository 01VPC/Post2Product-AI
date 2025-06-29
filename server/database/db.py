import certifi
from flask_mongoengine import MongoEngine
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config import Config

# Initialize MongoEngine instance
db = MongoEngine()

def initialize_db(app):
    """Initialize the database connection"""
    db.init_app(app)
    return db