from flask import Blueprint, request, jsonify
from PIL import Image
import io
from app.models.disease_detector import DiseaseDetector

bp = Blueprint('prediction', __name__)
disease_detector = DiseaseDetector()

@bp.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    try:
        # Get image file
        file = request.files['image']
        image = Image.open(file.stream).convert('RGB')
        
        # Get prediction
        result = disease_detector.predict(image)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500 