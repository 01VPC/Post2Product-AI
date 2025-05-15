from flask import Flask
from database.db import initialize_db
from routes.instagram_auth import instagram_auth  
from routes.media import media_bp
from dotenv import load_dotenv
import os 
from flask_jwt_extended import JWTManager

load_dotenv()

# Create the Flask app
app = Flask(__name__)

# Configuration
app.config['MONGODB_SETTINGS'] = {
    'host': os.getenv("MONGO_URI")
}

app.secret_key = os.getenv("FLASK_SECRET_KEY")

app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")  # Fixed here
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# Initialize extensions
initialize_db(app)
jwt = JWTManager(app)  # Initialize JWT after setting config

# Import models AFTER initializing db
from models import User, Media, Product, RefinedProduct, AmazonListedReady

# Register blueprints
from routes.authentication import auth_bp

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(instagram_auth, url_prefix='/instagram')
app.register_blueprint(media_bp, url_prefix='/media')

@app.route('/')
def index():
    return "Post2Product backend is running 🚀"

if __name__ == '__main__':
    app.run(debug=True)
