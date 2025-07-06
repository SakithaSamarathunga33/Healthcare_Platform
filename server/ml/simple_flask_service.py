#!/usr/bin/env python3
"""
Simple Flask Medical Symptom Prediction Service
Uses rule-based prediction without external ML dependencies
"""

import json
import sys
import os
from datetime import datetime

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our simple predictor
from simple_prediction_service import SimpleSymptomPredictor

# Simple Flask implementation without external dependencies
class SimpleFlaskApp:
    def __init__(self):
        self.predictor = SimpleSymptomPredictor()
        self.model_loaded = True
        
    def health_check(self):
        """Health check endpoint"""
        return {
            'status': 'healthy',
            'model_loaded': self.model_loaded,
            'timestamp': datetime.now().isoformat()
        }
    
    def predict_symptoms(self, request_data):
        """Predict medical specialty from symptoms"""
        try:
            if not self.model_loaded:
                return {
                    'success': False,
                    'error': 'Model not loaded'
                }, 500
            
            if not request_data:
                return {
                    'success': False,
                    'error': 'No JSON data provided'
                }, 400
            
            symptoms = request_data.get('symptoms', '').strip()
            
            if not symptoms:
                return {
                    'success': False,
                    'error': 'No symptoms provided'
                }, 400
            
            # Make prediction
            prediction = self.predictor.predict_specialty(symptoms)
            
            # Return prediction
            return {
                'success': True,
                'prediction': prediction,
                'timestamp': datetime.now().isoformat()
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500
    
    def get_model_info(self):
        """Get information about the loaded model"""
        try:
            if not self.model_loaded:
                return {
                    'success': False,
                    'error': 'Model not loaded'
                }, 500
            
            return {
                'success': True,
                'model_info': self.predictor.training_metadata
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }, 500

# Simple HTTP server implementation
def simple_http_server():
    """Simple HTTP server without Flask"""
    try:
        from http.server import HTTPServer, BaseHTTPRequestHandler
        import urllib.parse
        
        app = SimpleFlaskApp()
        
        class RequestHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == '/health':
                    response = app.health_check()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(response).encode())
                
                elif self.path == '/model/info':
                    response, status = app.get_model_info()
                    self.send_response(status)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(response).encode())
                
                else:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'error': 'Endpoint not found'}).encode())
            
            def do_POST(self):
                if self.path == '/predict':
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    
                    try:
                        request_data = json.loads(post_data.decode('utf-8'))
                        response, status = app.predict_symptoms(request_data)
                        
                        self.send_response(status)
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps(response).encode())
                    
                    except json.JSONDecodeError:
                        self.send_response(400)
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({'success': False, 'error': 'Invalid JSON'}).encode())
                
                else:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'error': 'Endpoint not found'}).encode())
            
            def log_message(self, format, *args):
                # Custom logging
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")
        
        port = int(os.environ.get('ML_SERVICE_PORT', 5001))
        host = os.environ.get('ML_SERVICE_HOST', '127.0.0.1')
        
        server = HTTPServer((host, port), RequestHandler)
        print(f"Starting Simple ML Service on {host}:{port}")
        print(f"Model type: {app.predictor.model}")
        print(f"Specialties supported: {len(app.predictor.specialty_rules)}")
        
        server.serve_forever()
        
    except Exception as e:
        print(f"Error starting server: {e}")
        return

def main():
    """Main function to start the service"""
    print("Simple Medical Symptom Prediction Service")
    print("=" * 50)
    
    # Test the predictor first
    try:
        predictor = SimpleSymptomPredictor()
        test_symptoms = "chest pain and shortness of breath"
        prediction = predictor.predict_specialty(test_symptoms)
        
        print(f"[OK] Predictor test successful")
        print(f"Test symptoms: {test_symptoms}")
        print(f"Predicted specialty: {prediction['recommendedSpecialty']}")
        print(f"Confidence: {prediction['confidence']:.4f}")
        print(f"Urgency: {prediction['urgencyLevel']}")
        print()
        
        # Start the HTTP server
        simple_http_server()
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return

if __name__ == "__main__":
    main() 