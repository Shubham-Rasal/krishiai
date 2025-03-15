from flask import Flask
from flask_cors import CORS
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    app.config.from_object(config_class)

    # Initialize ML model
    from app.models.disease_detector import DiseaseDetector
    disease_detector = DiseaseDetector()
    
    # Register blueprints
    from app.routes.prediction import bp as prediction_bp
    app.register_blueprint(prediction_bp)

    return app 