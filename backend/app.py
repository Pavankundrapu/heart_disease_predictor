# KB22 Heart Disease Prediction Flask Backend - Enhanced with Multiple ML Models
# Save this as: app.py in your backend folder

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score, precision_score, recall_score, f1_score
import joblib
import os
import warnings
import sys
import urllib.request
import time
from datetime import datetime

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # Allow React app

# Global variables
best_model = None
best_scaler = None
model_results = {}
feature_names = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
    'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

def download_uci_dataset():
    """Download the actual UCI Heart Disease dataset"""
    print("🌐 Downloading UCI Heart Disease dataset...")
    
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
    filename = "cleveland.data"
    
    try:
        if not os.path.exists(filename):
            print(f"📥 Downloading from: {url}")
            urllib.request.urlretrieve(url, filename)
            print("✅ Dataset downloaded successfully!")
        else:
            print("✅ Dataset already exists locally")
        
        return filename
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        return None

def load_uci_dataset():
    """Load and preprocess the real UCI Heart Disease dataset"""
    print("📊 Loading UCI Heart Disease dataset...")
    
    filename = download_uci_dataset()
    if filename is None:
        raise Exception("Could not download UCI dataset")
    
    columns = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
        'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target'
    ]
    
    try:
        df = pd.read_csv(filename, names=columns, na_values='?')
        
        print(f"📈 Original dataset shape: {df.shape}")
        print(f"❓ Missing values: {df.isnull().sum().sum()}")
        
        # Handle missing values
        if df.isnull().sum().sum() > 0:
            print("🔧 Handling missing values...")
            for col in df.columns:
                if df[col].dtype in ['float64', 'int64'] and df[col].isnull().sum() > 0:
                    median_val = df[col].median()
                    df[col].fillna(median_val, inplace=True)
                    print(f"   - Filled {col} missing values with median: {median_val}")
        
        # Convert target to binary
        df['target'] = (df['target'] > 0).astype(int)
        
        print(f"✅ Dataset processed: {len(df)} samples")
        print(f"💗 Heart Disease cases: {df['target'].sum()} ({df['target'].mean()*100:.1f}%)")
        print(f"❤️ No Heart Disease cases: {(df['target']==0).sum()} ({(1-df['target'].mean())*100:.1f}%)")
        
        return df
        
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        raise

def get_ml_models():
    """Define and return all ML models to test"""
    models = {
        'K-Neighbors': KNeighborsClassifier(n_neighbors=5, weights='uniform'),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42, max_depth=5),
        'Support Vector Machine': SVC(probability=True, random_state=42, kernel='rbf', C=1.0),
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'Naive Bayes': GaussianNB(),
        'Decision Tree': DecisionTreeClassifier(random_state=42, max_depth=10, min_samples_split=10),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), random_state=42, max_iter=1000)
    }
    return models

def evaluate_model(model, X_train, X_test, y_train, y_test, model_name):
    """Comprehensive model evaluation"""
    print(f"🔍 Evaluating {model_name}...")
    
    # Train model
    start_time = time.time()
    model.fit(X_train, y_train)
    training_time = time.time() - start_time
    
    # Make predictions
    start_time = time.time()
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
    prediction_time = time.time() - start_time
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    # ROC AUC (if probabilities available)
    roc_auc = roc_auc_score(y_test, y_pred_proba) if y_pred_proba is not None else None
    
    # Cross-validation score
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    
    results = {
        'model_name': model_name,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'roc_auc': roc_auc,
        'cv_mean': cv_mean,
        'cv_std': cv_std,
        'training_time': training_time,
        'prediction_time': prediction_time,
        'confusion_matrix': {
            'true_negative': int(tn),
            'false_positive': int(fp),
            'false_negative': int(fn),
            'true_positive': int(tp)
        },
        'sensitivity': tp / (tp + fn) if (tp + fn) > 0 else 0,  # Recall
        'specificity': tn / (tn + fp) if (tn + fp) > 0 else 0,
        'model_object': model
    }
    
    return results

def create_ensemble_model(models, X_train, y_train):
    """Create an ensemble model from top performers"""
    print("🤖 Creating ensemble model from top performers...")
    
    # Select top 3 models based on CV score
    top_models = sorted(models, key=lambda x: x['cv_mean'], reverse=True)[:3]
    
    estimators = []
    for model_result in top_models:
        estimators.append((
            model_result['model_name'].replace(' ', '_').lower(),
            model_result['model_object']
        ))
    
    # Create voting classifier
    ensemble = VotingClassifier(
        estimators=estimators,
        voting='soft'  # Use probabilities
    )
    
    return ensemble

def train_and_compare_models():
    """Train multiple models and compare their performance"""
    global best_model, best_scaler, model_results
    
    print("🔄 Training and comparing multiple ML models...")
    print("=" * 80)
    
    # Load dataset
    df = load_uci_dataset()
    
    # Prepare features and target
    X = df[feature_names]
    y = df['target']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Get all models
    models = get_ml_models()
    results = []
    
    print(f"📊 Testing {len(models)} different algorithms...")
    print("=" * 80)
    
    # Evaluate each model
    for model_name, model in models.items():
        try:
            result = evaluate_model(model, X_train_scaled, X_test_scaled, y_train, y_test, model_name)
            results.append(result)
            
            print(f"✅ {model_name}:")
            print(f"   Accuracy: {result['accuracy']:.4f} | F1: {result['f1_score']:.4f} | "
                  f"CV: {result['cv_mean']:.4f}±{result['cv_std']:.4f}")
            
        except Exception as e:
            print(f"❌ Error with {model_name}: {e}")
    
    # Create ensemble model
    try:
        ensemble = create_ensemble_model(results, X_train_scaled, y_train)
        ensemble_result = evaluate_model(ensemble, X_train_scaled, X_test_scaled, y_train, y_test, "Ensemble")
        results.append(ensemble_result)
        print(f"✅ Ensemble Model:")
        print(f"   Accuracy: {ensemble_result['accuracy']:.4f} | F1: {ensemble_result['f1_score']:.4f} | "
              f"CV: {ensemble_result['cv_mean']:.4f}±{ensemble_result['cv_std']:.4f}")
    except Exception as e:
        print(f"⚠️ Could not create ensemble: {e}")
    
    # Sort results by composite score
    def composite_score(result):
        """Calculate composite score based on multiple metrics"""
        return (result['accuracy'] * 0.3 + 
                result['f1_score'] * 0.3 + 
                result['cv_mean'] * 0.3 + 
                (result['roc_auc'] or 0) * 0.1)
    
    results.sort(key=composite_score, reverse=True)
    
    # Select best model
    best_result = results[0]
    best_model = best_result['model_object']
    best_scaler = scaler
    
    # Store results for API
    model_results = {
        'best_model': best_result,
        'all_results': results,
        'comparison_timestamp': datetime.now().isoformat(),
        'dataset_info': {
            'samples': len(df),
            'features': len(feature_names),
            'positive_cases': int(y.sum()),
            'negative_cases': int(len(y) - y.sum())
        }
    }
    
    print("=" * 80)
    print(f"🏆 BEST MODEL: {best_result['model_name']}")
    print(f"📊 Performance Summary:")
    print(f"   Accuracy: {best_result['accuracy']:.4f} ({best_result['accuracy']*100:.2f}%)")
    print(f"   Precision: {best_result['precision']:.4f}")
    print(f"   Recall: {best_result['recall']:.4f}")
    print(f"   F1-Score: {best_result['f1_score']:.4f}")
    print(f"   ROC-AUC: {best_result['roc_auc']:.4f}" if best_result['roc_auc'] else "   ROC-AUC: N/A")
    print(f"   Cross-Val: {best_result['cv_mean']:.4f}±{best_result['cv_std']:.4f}")
    print(f"   Sensitivity: {best_result['sensitivity']:.4f}")
    print(f"   Specificity: {best_result['specificity']:.4f}")
    print("=" * 80)
    
    # Display top 5 models comparison
    print("\n🥇 TOP 5 MODELS COMPARISON:")
    print("-" * 100)
    print(f"{'Rank':<5} {'Model':<20} {'Accuracy':<10} {'F1-Score':<10} {'CV-Score':<15} {'ROC-AUC':<10}")
    print("-" * 100)
    
    for i, result in enumerate(results[:5]):
        roc_display = f"{result['roc_auc']:.4f}" if result['roc_auc'] else "N/A"
        cv_display = f"{result['cv_mean']:.4f}±{result['cv_std']:.3f}"
        print(f"{i+1:<5} {result['model_name']:<20} {result['accuracy']:<10.4f} "
              f"{result['f1_score']:<10.4f} {cv_display:<15} {roc_display:<10}")
    
    print("-" * 100)
    
    # Save best model
    try:
        joblib.dump(best_model, 'kb22_best_model_uci.pkl')
        joblib.dump(best_scaler, 'kb22_best_scaler_uci.pkl')
        joblib.dump(model_results, 'kb22_model_comparison.pkl')
        print("💾 Best model and comparison results saved successfully!")
    except Exception as e:
        print(f"⚠️ Could not save models: {e}")
    
    return best_result['accuracy']

def validate_input(data):
    """Validate input data based on UCI dataset ranges"""
    missing = [f for f in feature_names if f not in data or data[f] is None]
    if missing:
        raise ValueError(f"Missing features: {missing}")
    
    validations = {
        'age': (29, 77, "Age"),
        'sex': (0, 1, "Sex (0=Female, 1=Male)"),
        'cp': (0, 3, "Chest Pain Type (0=typical, 1=atypical, 2=non-anginal, 3=asymptomatic)"),
        'trestbps': (94, 200, "Resting Blood Pressure (mmHg)"),
        'chol': (126, 564, "Cholesterol (mg/dl)"),
        'fbs': (0, 1, "Fasting Blood Sugar >120mg/dl (0=No, 1=Yes)"),
        'restecg': (0, 2, "Resting ECG (0=normal, 1=ST-T abnormality, 2=LVH)"),
        'thalach': (71, 202, "Maximum Heart Rate Achieved"),
        'exang': (0, 1, "Exercise Induced Angina (0=No, 1=Yes)"),
        'oldpeak': (0, 6.2, "ST Depression induced by exercise"),
        'slope': (0, 2, "Slope of peak exercise ST segment (0=up, 1=flat, 2=down)"),
        'ca': (0, 3, "Number of major vessels colored by fluoroscopy"),
        'thal': (1, 3, "Thalassemia (1=normal, 2=fixed defect, 3=reversible defect)")
    }
    
    for feature, (min_val, max_val, name) in validations.items():
        value = data[feature]
        try:
            value = float(value)
            if not (min_val <= value <= max_val):
                raise ValueError(f"{name} must be between {min_val} and {max_val}")
        except (ValueError, TypeError):
            raise ValueError(f"{name} must be a valid number")

@app.route('/')
def home():
    """Health check"""
    best_model_name = model_results.get('best_model', {}).get('model_name', 'Not initialized')
    best_accuracy = model_results.get('best_model', {}).get('accuracy', 0)
    
    return jsonify({
        'status': '✅ KB22 Enhanced Heart Disease API is running!',
        'best_model': best_model_name,
        'best_accuracy': f"{best_accuracy*100:.2f}%" if best_accuracy else "N/A",
        'models_tested': len(model_results.get('all_results', [])),
        'dataset': 'Real UCI Heart Disease Dataset',
        'endpoints': {
            'predict': 'POST /api/predict/kb22',
            'model_info': 'GET /api/model/info',
            'model_comparison': 'GET /api/model/comparison'
        }
    })

@app.route('/api/model/info')
def model_info():
    """Get best model information"""
    if not model_results:
        return jsonify({'error': 'Model not initialized'}), 500
    
    best = model_results['best_model']
    return jsonify({
        'best_model': {
            'name': best['model_name'],
            'accuracy': best['accuracy'],
            'precision': best['precision'],
            'recall': best['recall'],
            'f1_score': best['f1_score'],
            'roc_auc': best['roc_auc'],
            'cv_score': f"{best['cv_mean']:.4f}±{best['cv_std']:.4f}",
            'sensitivity': best['sensitivity'],
            'specificity': best['specificity']
        },
        'dataset_info': model_results['dataset_info'],
        'comparison_timestamp': model_results['comparison_timestamp'],
        'features': feature_names,
        'feature_descriptions': {
            'age': 'Age in years',
            'sex': 'Sex (1=male, 0=female)',
            'cp': 'Chest pain type (0-3)',
            'trestbps': 'Resting blood pressure (mmHg)',
            'chol': 'Serum cholesterol (mg/dl)',
            'fbs': 'Fasting blood sugar >120mg/dl (1=true, 0=false)',
            'restecg': 'Resting ECG results (0-2)',
            'thalach': 'Maximum heart rate achieved',
            'exang': 'Exercise induced angina (1=yes, 0=no)',
            'oldpeak': 'ST depression induced by exercise',
            'slope': 'Slope of peak exercise ST segment (0-2)',
            'ca': 'Number of major vessels (0-3)',
            'thal': 'Thalassemia (1=normal, 2=fixed defect, 3=reversible defect)'
        }
    })

@app.route('/api/model/comparison')
def model_comparison():
    """Get detailed model comparison results"""
    if not model_results:
        return jsonify({'error': 'Model comparison not available'}), 500
    
    comparison_data = []
    for i, result in enumerate(model_results['all_results']):
        comparison_data.append({
            'rank': i + 1,
            'model_name': result['model_name'],
            'accuracy': result['accuracy'],
            'precision': result['precision'],
            'recall': result['recall'],
            'f1_score': result['f1_score'],
            'roc_auc': result['roc_auc'],
            'cv_mean': result['cv_mean'],
            'cv_std': result['cv_std'],
            'sensitivity': result['sensitivity'],
            'specificity': result['specificity'],
            'training_time': result['training_time'],
            'prediction_time': result['prediction_time'],
            'confusion_matrix': result['confusion_matrix']
        })
    
    return jsonify({
        'comparison_results': comparison_data,
        'best_model': model_results['best_model']['model_name'],
        'dataset_info': model_results['dataset_info'],
        'comparison_timestamp': model_results['comparison_timestamp'],
        'total_models_tested': len(comparison_data)
    })

@app.route('/api/predict/kb22', methods=['POST'])
def predict():
    """Main prediction endpoint using best model"""
    global best_model, best_scaler
    
    if best_model is None or best_scaler is None:
        return jsonify({
            'error': 'Model not initialized. Please restart the server.',
            'status': 'error'
        }), 500
    
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No input data provided")
        
        print(f"📥 Received prediction request: {data}")
        
        # Validate input
        validate_input(data)
        
        # Prepare input for prediction
        input_array = np.array([[float(data[feature]) for feature in feature_names]])
        input_scaled = best_scaler.transform(input_array)
        
        # Make prediction
        prediction = best_model.predict(input_scaled)[0]
        probabilities = best_model.predict_proba(input_scaled)[0] if hasattr(best_model, 'predict_proba') else [1-prediction, prediction]
        
        confidence = probabilities[prediction]
        heart_disease_prob = probabilities[1]
        
        # Determine risk level
        if heart_disease_prob >= 0.7:
            risk_level = 'High Risk'
        elif heart_disease_prob >= 0.4:
            risk_level = 'Moderate Risk'
        else:
            risk_level = 'Low Risk'
        
        result = {
            'prediction': int(prediction),
            'probability': float(heart_disease_prob),
            'confidence': float(confidence),
            'probabilities': {
                'no_heart_disease': float(probabilities[0]),
                'heart_disease': float(probabilities[1])
            },
            'risk_level': risk_level,
            'recommendation': get_recommendation(prediction, heart_disease_prob),
            'status': 'success',
            'model_info': {
                'algorithm': model_results['best_model']['model_name'],
                'accuracy': f"{model_results['best_model']['accuracy']*100:.2f}%",
                'dataset': 'UCI Heart Disease',
                'trained_on': f"{model_results['dataset_info']['samples']} real patient records"
            }
        }
        
        print(f"📤 Prediction result: {result['risk_level']} (probability: {heart_disease_prob:.3f})")
        return jsonify(result)
        
    except ValueError as e:
        print(f"❌ Validation Error: {e}")
        return jsonify({
            'error': f'Input validation failed: {str(e)}',
            'status': 'error'
        }), 400
        
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}',
            'status': 'error'
        }), 500

def get_recommendation(prediction, probability):
    """Generate recommendations based on prediction"""
    if prediction == 1:
        if probability >= 0.8:
            return "High risk detected. Please consult a cardiologist immediately for further evaluation."
        else:
            return "Moderate to high risk detected. Please schedule an appointment with your doctor soon."
    else:
        if probability <= 0.2:
            return "Low risk detected. Continue maintaining a healthy lifestyle."
        else:
            return "Low to moderate risk. Consider regular health check-ups and lifestyle improvements."

def initialize():
    """Initialize the system with model comparison"""
    global best_model, best_scaler, model_results
    
    print("\n🚀 Initializing KB22 Enhanced Heart Disease Prediction API...")
    print("🤖 Multi-Algorithm Comparison System")
    print("📊 Using Real UCI Heart Disease Dataset")
    print("=" * 80)
    
    # Try to load existing models and comparison
    model_files_exist = all(os.path.exists(f) for f in [
        'kb22_best_model_uci.pkl', 
        'kb22_best_scaler_uci.pkl', 
        'kb22_model_comparison.pkl'
    ])
    
    if model_files_exist:
        try:
            best_model = joblib.load('kb22_best_model_uci.pkl')
            best_scaler = joblib.load('kb22_best_scaler_uci.pkl')
            model_results = joblib.load('kb22_model_comparison.pkl')
            print("✅ Loaded existing model comparison results!")
            print(f"🏆 Best Model: {model_results['best_model']['model_name']}")
            print(f"📊 Accuracy: {model_results['best_model']['accuracy']*100:.2f}%")
        except Exception as e:
            print(f"⚠️ Could not load existing models: {e}")
            best_model = None
            best_scaler = None
            model_results = {}
    
    # Train and compare models if needed
    if best_model is None or not model_results:
        try:
            print("🔄 Starting comprehensive model comparison...")
            accuracy = train_and_compare_models()
            print(f"✅ Model comparison completed! Best accuracy: {accuracy*100:.2f}%")
        except Exception as e:
            print(f"❌ Error during model comparison: {e}")
            print("Please check your internet connection for dataset download.")
            sys.exit(1)
    
    print("=" * 80)
    print("🎯 KB22 Enhanced API ready!")
    print(f"🏆 Best Model: {model_results['best_model']['model_name']}")
    print(f"📊 Best Accuracy: {model_results['best_model']['accuracy']*100:.2f}%")
    print(f"🔢 Models Tested: {len(model_results['all_results'])}")
    print(f"📡 Server URL: http://localhost:5000")
    print("=" * 80)

if __name__ == '__main__':
    # Initialize with model comparison
    initialize()
    
    # Start Flask app
    print("\n🌟 Starting Flask development server...")
    print("📝 Keep this window open while using the app")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 80)
    
    app.run(
        debug=True, 
        port=5000, 
        host='127.0.0.1',
        use_reloader=False
    )