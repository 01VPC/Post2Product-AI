from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from utils.database import init_db, db

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
jwt = JWTManager(app)
CORS(app)

# Initialize database
db = init_db(app)
migrate = Migrate(app, db)

# Import routes after db initialization to avoid circular imports
from api.auth import auth_api
from api.instagram_api import instagram_api
from api.amazon_api import amazon_api
from api.products_api import products_api
from api.analytics_api import analytics_api

# Register blueprints
app.register_blueprint(auth_api, url_prefix='/api/auth')
app.register_blueprint(instagram_api, url_prefix='/api/instagram')
app.register_blueprint(amazon_api, url_prefix='/api/amazon')
app.register_blueprint(products_api, url_prefix='/api/products')
app.register_blueprint(analytics_api, url_prefix='/api/analytics')

if __name__ == '__main__':
    app.run(debug=True)