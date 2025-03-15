import torch
import torch.nn as nn
from torchvision.models import resnet50
from torchvision import transforms
import os

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
        
        # Load trained weights
        model_path = os.path.join(os.path.dirname(__file__), '../../models/best_ResNet-50.pth')
        state_dict = torch.load(model_path, map_location=self.device)
        model.load_state_dict(state_dict)
        model.to(self.device)
        model.eval()
        
        return model

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