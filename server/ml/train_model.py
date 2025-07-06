#!/usr/bin/env python3
"""
Medical Symptom Prediction Model Training Script
Trains a machine learning model to predict medical specialties from symptoms
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json
from datetime import datetime

class MedicalSymptomPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 3),
            min_df=1,
            max_df=0.9
        )
        
        # Ensemble of multiple classifiers for better accuracy
        self.rf_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42
        )
        
        self.nb_classifier = MultinomialNB(alpha=0.1)
        
        self.svm_classifier = SVC(
            kernel='rbf',
            probability=True,
            random_state=42
        )
        
        # Voting classifier combines all models
        self.model = VotingClassifier(
            estimators=[
                ('rf', self.rf_classifier),
                ('nb', self.nb_classifier),
                ('svm', self.svm_classifier)
            ],
            voting='soft'
        )
        
        self.label_encoder = LabelEncoder()
        self.urgency_encoder = LabelEncoder()
        self.is_trained = False
        
    def load_data(self, csv_path):
        """Load and preprocess the medical symptoms dataset"""
        print(f"Loading data from {csv_path}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset not found: {csv_path}")
            
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} samples with {len(df.columns)} features")
        
        # Clean and preprocess symptoms text
        df['symptoms'] = df['symptoms'].str.lower().str.strip()
        
        # Remove duplicates
        df = df.drop_duplicates(subset=['symptoms'])
        
        print(f"After cleaning: {len(df)} unique samples")
        print(f"Medical specialties: {df['specialty'].nunique()}")
        print(f"Specialty distribution:\n{df['specialty'].value_counts()}")
        
        return df
    
    def prepare_features(self, df):
        """Prepare features for training"""
        print("Preparing features...")
        
        # Extract text features using TF-IDF
        X_text = self.vectorizer.fit_transform(df['symptoms'])
        
        # Encode labels
        y_specialty = self.label_encoder.fit_transform(df['specialty'])
        y_urgency = self.urgency_encoder.fit_transform(df['urgency'])
        
        # Create confidence scores (use provided confidence as feature)
        confidence_scores = df['confidence'].values
        
        return X_text, y_specialty, y_urgency, confidence_scores
    
    def train(self, csv_path):
        """Train the model on the dataset"""
        print("Starting model training...")
        
        # Load data
        df = self.load_data(csv_path)
        
        # Prepare features
        X, y_specialty, y_urgency, confidence_scores = self.prepare_features(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_specialty, test_size=0.2, random_state=42, stratify=y_specialty
        )
        
        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")
        
        # Train the ensemble model
        print("Training ensemble model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate the model
        train_accuracy = self.model.score(X_train, y_train)
        test_accuracy = self.model.score(X_test, y_test)
        
        print(f"Training accuracy: {train_accuracy:.4f}")
        print(f"Test accuracy: {test_accuracy:.4f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5)
        print(f"Cross-validation accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Detailed classification report
        y_pred = self.model.predict(X_test)
        specialty_names = self.label_encoder.inverse_transform(np.unique(y_test))
        
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=specialty_names))
        
        self.is_trained = True
        
        # Store training metadata
        self.training_metadata = {
            'training_date': datetime.now().isoformat(),
            'dataset_size': len(df),
            'n_features': X.shape[1],
            'n_specialties': len(specialty_names),
            'specialties': specialty_names.tolist(),
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        return {
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_scores': cv_scores
        }
    
    def predict_specialty(self, symptoms_text):
        """Predict medical specialty from symptoms"""
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Preprocess input
        symptoms_text = symptoms_text.lower().strip()
        
        # Vectorize input
        X_input = self.vectorizer.transform([symptoms_text])
        
        # Get predictions
        specialty_encoded = self.model.predict(X_input)[0]
        specialty_proba = self.model.predict_proba(X_input)[0]
        
        # Decode specialty
        specialty = self.label_encoder.inverse_transform([specialty_encoded])[0]
        confidence = float(specialty_proba.max())
        
        # Get alternative specialties
        top_indices = np.argsort(specialty_proba)[-3:][::-1]  # Top 3
        alternatives = []
        
        for idx in top_indices[1:]:  # Skip the top prediction
            alt_specialty = self.label_encoder.inverse_transform([idx])[0]
            alt_confidence = float(specialty_proba[idx])
            if alt_confidence > 0.1:  # Only include if confidence > 10%
                alternatives.append({
                    'specialty': alt_specialty,
                    'confidence': alt_confidence
                })
        
        # Determine urgency based on specialty and confidence
        urgency_level = self._determine_urgency(specialty, confidence, symptoms_text)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(specialty, confidence, symptoms_text)
        
        # Generate suggested questions
        suggested_questions = self._generate_questions(specialty)
        
        # Generate red flags
        red_flags = self._generate_red_flags(symptoms_text)
        
        return {
            'recommendedSpecialty': specialty,
            'confidence': confidence,
            'alternativeSpecialties': alternatives,
            'urgencyLevel': urgency_level,
            'reasoning': reasoning,
            'suggestedQuestions': suggested_questions,
            'redFlags': red_flags
        }
    
    def _determine_urgency(self, specialty, confidence, symptoms_text):
        """Determine urgency level based on specialty and symptoms"""
        symptoms_lower = symptoms_text.lower()
        
        # Critical conditions
        critical_keywords = ['heart attack', 'stroke', 'severe trauma', 'poisoning', 'overdose', 'severe allergic reaction']
        if any(keyword in symptoms_lower for keyword in critical_keywords):
            return 'critical'
        
        # High urgency specialties or symptoms
        high_urgency_specialties = ['Emergency Medicine', 'Cardiology']
        high_urgency_symptoms = ['chest pain', 'shortness of breath', 'severe pain', 'bleeding', 'seizure']
        
        if specialty in high_urgency_specialties or any(symptom in symptoms_lower for symptom in high_urgency_symptoms):
            return 'high'
        
        # Medium urgency for most medical conditions
        if confidence > 0.7:
            return 'medium'
        
        return 'low'
    
    def _generate_reasoning(self, specialty, confidence, symptoms_text):
        """Generate reasoning for the prediction"""
        reasoning_templates = {
            'Cardiology': "The symptoms suggest cardiovascular issues that require cardiology evaluation for proper diagnosis and treatment.",
            'Dermatology': "The skin-related symptoms indicate dermatological conditions that need specialist assessment.",
            'Neurology': "The neurological symptoms warrant evaluation by a neurologist for proper diagnosis.",
            'Gastroenterology': "The digestive symptoms suggest gastrointestinal issues requiring gastroenterology consultation.",
            'Orthopedics': "The bone and joint symptoms indicate orthopedic conditions requiring specialist evaluation.",
            'General Practice': "These symptoms are commonly seen in general practice and can be initially evaluated by a general practitioner.",
            'Emergency Medicine': "The symptoms suggest a serious condition requiring immediate emergency medical attention.",
        }
        
        base_reasoning = reasoning_templates.get(specialty, 
            f"Based on the symptoms described, {specialty} consultation is recommended for proper evaluation and treatment.")
        
        confidence_note = f" The prediction confidence is {confidence:.0%}."
        
        return base_reasoning + confidence_note
    
    def _generate_questions(self, specialty):
        """Generate suggested questions for the specialty"""
        questions_by_specialty = {
            'Cardiology': [
                "Do you have any family history of heart disease?",
                "Are you experiencing any chest pain or pressure?",
                "Do you have shortness of breath during physical activity?",
                "Are you taking any medications for blood pressure or heart conditions?",
                "Have you noticed any irregular heartbeat or palpitations?"
            ],
            'Dermatology': [
                "When did you first notice these skin changes?",
                "Have you used any new skin products or cosmetics recently?",
                "Do you have any known allergies to medications or substances?",
                "Does the affected area itch or cause pain?",
                "Have you noticed any changes in size, color, or texture?"
            ],
            'General Practice': [
                "How long have you been experiencing these symptoms?",
                "Are there any other symptoms you've noticed?",
                "Have you taken any medications for this condition?",
                "Do you have any chronic medical conditions?",
                "Are you currently taking any medications or supplements?"
            ]
        }
        
        return questions_by_specialty.get(specialty, [
            "How long have you been experiencing these symptoms?",
            "Are there any other symptoms you've noticed?",
            "Have you taken any medications for this condition?",
            "Do you have any chronic medical conditions?",
            "When did the symptoms first start?"
        ])
    
    def _generate_red_flags(self, symptoms_text):
        """Generate red flags based on symptoms"""
        symptoms_lower = symptoms_text.lower()
        red_flags = []
        
        # Cardiovascular red flags
        if any(word in symptoms_lower for word in ['chest pain', 'heart', 'cardiac']):
            red_flags.extend([
                "Severe chest pain or pressure",
                "Shortness of breath at rest",
                "Fainting or loss of consciousness",
                "Severe sweating with chest discomfort"
            ])
        
        # Neurological red flags
        if any(word in symptoms_lower for word in ['headache', 'dizziness', 'confusion']):
            red_flags.extend([
                "Sudden, severe headache unlike any experienced before",
                "Confusion or disorientation",
                "Sudden weakness or numbness on one side of the body",
                "Difficulty speaking or understanding speech"
            ])
        
        # General red flags
        red_flags.extend([
            "High fever that doesn't respond to medication",
            "Severe difficulty breathing",
            "Persistent vomiting or inability to keep fluids down",
            "Signs of severe dehydration"
        ])
        
        # Remove duplicates and limit to 5
        return list(dict.fromkeys(red_flags))[:5]
    
    def save_model(self, model_dir):
        """Save the trained model and metadata"""
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        os.makedirs(model_dir, exist_ok=True)
        
        # Save model components
        joblib.dump(self.model, os.path.join(model_dir, 'model.joblib'))
        joblib.dump(self.vectorizer, os.path.join(model_dir, 'vectorizer.joblib'))
        joblib.dump(self.label_encoder, os.path.join(model_dir, 'label_encoder.joblib'))
        joblib.dump(self.urgency_encoder, os.path.join(model_dir, 'urgency_encoder.joblib'))
        
        # Save metadata
        with open(os.path.join(model_dir, 'metadata.json'), 'w') as f:
            json.dump(self.training_metadata, f, indent=2)
        
        print(f"Model saved to {model_dir}")
    
    def load_model(self, model_dir):
        """Load a trained model"""
        if not os.path.exists(model_dir):
            raise FileNotFoundError(f"Model directory not found: {model_dir}")
        
        # Load model components
        self.model = joblib.load(os.path.join(model_dir, 'model.joblib'))
        self.vectorizer = joblib.load(os.path.join(model_dir, 'vectorizer.joblib'))
        self.label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.joblib'))
        self.urgency_encoder = joblib.load(os.path.join(model_dir, 'urgency_encoder.joblib'))
        
        # Load metadata
        with open(os.path.join(model_dir, 'metadata.json'), 'r') as f:
            self.training_metadata = json.load(f)
        
        self.is_trained = True
        print(f"Model loaded from {model_dir}")
        print(f"Model trained on {self.training_metadata['training_date']}")
        print(f"Test accuracy: {self.training_metadata['test_accuracy']:.4f}")

def main():
    """Main training function"""
    print("Medical Symptom Prediction Model Training")
    print("=" * 50)
    
    # Initialize predictor
    predictor = MedicalSymptomPredictor()
    
    # Train the model
    dataset_path = os.path.join('data', 'medical_symptoms_dataset.csv')
    model_dir = 'models'
    
    try:
        # Train model
        results = predictor.train(dataset_path)
        
        # Save model
        predictor.save_model(model_dir)
        
        # Test prediction
        print("\nTesting model prediction...")
        test_symptoms = "chest pain shortness of breath"
        prediction = predictor.predict_specialty(test_symptoms)
        
        print(f"Test symptoms: {test_symptoms}")
        print(f"Predicted specialty: {prediction['recommendedSpecialty']}")
        print(f"Confidence: {prediction['confidence']:.4f}")
        print(f"Urgency: {prediction['urgencyLevel']}")
        
        print("\nModel training completed successfully!")
        
    except Exception as e:
        print(f"Error during training: {e}")
        raise

if __name__ == "__main__":
    main() 