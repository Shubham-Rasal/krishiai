import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv
import requests
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
MODEL_URL = "https://n8xskk8t0o.ufs.sh/f/9lg7ZYvhJ4T6BVeUMkXWm7GVrihD9LWYgqySNKbEHMzpnteo"

# Try to import PyTorch
try:
    import torch
    import torch.nn as nn
    from torchvision.models import resnet50
    from torchvision import transforms
    
    # Disease detector class
    class DiseaseDetector:
        CLASS_LABELS = [
            "BacterialBlight", 
            "BacterialLeafBlight", 
            "BacterialLeafStreak", 
            "Blast", 
            "BrownSpot", 
            "Normal", 
            "SheathBlight"
        ]

        def __init__(self):
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.model = self._load_model()
            self.transform = self._get_transforms()
            self.class_labels = self.CLASS_LABELS

        def _load_model(self):
            # Initialize model
            model = resnet50(weights=None)
            model.fc = nn.Linear(model.fc.in_features, len(self.CLASS_LABELS))
            
            # Download model weights from URL
            print("Downloading model weights...")
            response = requests.get(MODEL_URL, stream=True)
            if response.status_code != 200:
                raise Exception(f"Failed to download model: HTTP {response.status_code}")
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        tmp_file.write(chunk)
                tmp_path = tmp_file.name
            
            try:
                # Load trained weights
                state_dict = torch.load(tmp_path, map_location=self.device)
                model.load_state_dict(state_dict)
                model.to(self.device)
                model.eval()
                print("Model loaded successfully")
                return model
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

        def _get_transforms(self):
            return transforms.Compose([
                transforms.Resize((256, 256)),
                transforms.CenterCrop((224, 224)),
                transforms.ToTensor(),
            ])

        def predict(self, image):
            """
            Predict disease from image
            Args:
                image: PIL Image object
            Returns:
                dict: Prediction result with class label and confidence
            """
            try:
                # Transform image
                image_tensor = self.transform(image).unsqueeze(0)
                image_tensor = image_tensor.to(self.device)

                # Get prediction
                with torch.no_grad():
                    outputs = self.model(image_tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted_class = torch.max(probabilities, 1)

                return {
                    "prediction": self.class_labels[predicted_class.item()],
                    "confidence": float(confidence.item())
                }

            except Exception as e:
                raise Exception(f"Prediction error: {str(e)}")

    # Initialize disease detector
    disease_detector = DiseaseDetector()
    TORCH_AVAILABLE = True
    
except ImportError:
    print("PyTorch not available. Running in limited mode.")
    disease_detector = None
    TORCH_AVAILABLE = False

# Routes
@app.route('/api/predict', methods=['POST'])
def predict():
    if not TORCH_AVAILABLE:
        return jsonify({"error": "PyTorch is not available on this server"}), 503
        
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

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    status = "healthy" if TORCH_AVAILABLE else "limited"
    return jsonify({"status": status, "torch_available": TORCH_AVAILABLE}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 