from app import app
from utils.database import db
from flask_migrate import Migrate

migrate = Migrate(app, db)
