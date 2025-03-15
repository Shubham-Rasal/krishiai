import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
    MODEL_PATH = os.environ.get('MODEL_PATH') or os.path.join(os.path.dirname(__file__), 'models/best_ResNet-50.pth') 