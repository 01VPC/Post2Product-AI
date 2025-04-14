from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Initialize SQLAlchemy
db = SQLAlchemy()

# Create engine and session
def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        
    return db

def get_engine(config):
    """Create a database engine from config"""
    return create_engine(config.SQLALCHEMY_DATABASE_URI)

def get_session(engine):
    """Create a session from the engine"""
    session_factory = sessionmaker(bind=engine)
    return scoped_session(session_factory)

Base = declarative_base()