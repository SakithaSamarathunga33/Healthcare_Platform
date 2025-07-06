#!/usr/bin/env python3
"""
Medical Symptom Prediction Service
Flask API that serves the trained ML model for symptom prediction
"""

from flask import Flask, request, jsonify
import os
import sys
import json
from datetime import datetime
import logging

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our custom model class
from train_model import MedicalSymptomPredictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global model instance
model = None
model_loaded = False

def load_model():
    """Load the trained model"""
    global model, model_loaded
    
    try:
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        
        if not os.path.exists(model_dir):
            logger.error(f"Model directory not found: {model_dir}")
            return False
        
        model = MedicalSymptomPredictor()
        model.load_model(model_dir)
        model_loaded = True
        
        logger.info("Model loaded successfully")
        logger.info(f"Model training date: {model.training_metadata['training_date']}")
        logger.info(f"Model accuracy: {model.training_metadata['test_accuracy']:.4f}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

def train_model_if_needed():
    """Train the model if it doesn't exist"""
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    
    if not os.path.exists(model_dir) or not os.path.exists(os.path.join(model_dir, 'model.joblib')):
        logger.info("Model not found, training new model...")
        
        try:
            # Import and run training
            from train_model import main as train_main
            train_main()
            return True
        except Exception as e:
            logger.error(f"Failed to train model: {e}")
            return False
    
    return True

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_symptoms():
    """Predict medical specialty from symptoms"""
    try:
        # Check if model is loaded
        if not model_loaded:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        symptoms = data.get('symptoms', '').strip()
        
        if not symptoms:
            return jsonify({
                'success': False,
                'error': 'No symptoms provided'
            }), 400
        
        # Make prediction
        logger.info(f"Predicting symptoms: {symptoms}")
        prediction = model.predict_specialty(symptoms)
        
        # Log prediction result
        logger.info(f"Prediction: {prediction['recommendedSpecialty']} (confidence: {prediction['confidence']:.4f})")
        
        # Return prediction
        return jsonify({
            'success': True,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model/info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model"""
    try:
        if not model_loaded:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        return jsonify({
            'success': True,
            'model_info': model.training_metadata
        })
        
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model/retrain', methods=['POST'])
def retrain_model():
    """Retrain the model with fresh data"""
    try:
        logger.info("Starting model retraining...")
        
        # Import and run training
        from train_model import main as train_main
        train_main()
        
        # Reload the model
        if load_model():
            logger.info("Model retrained and reloaded successfully")
            return jsonify({
                'success': True,
                'message': 'Model retrained successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to reload retrained model'
            }), 500
            
    except Exception as e:
        logger.error(f"Retraining error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

def main():
    """Main function to start the Flask app"""
    logger.info("Starting Medical Symptom Prediction Service")
    
    # Train model if needed
    if not train_model_if_needed():
        logger.error("Failed to ensure model is trained")
        return
    
    # Load the model
    if not load_model():
        logger.error("Failed to load model")
        return
    
    # Start the Flask app
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    host = os.environ.get('ML_SERVICE_HOST', '127.0.0.1')
    
    logger.info(f"Starting Flask server on {host}:{port}")
    
    app.run(
        host=host,
        port=port,
        debug=False,
        threaded=True
    )

if __name__ == '__main__':
    main() 