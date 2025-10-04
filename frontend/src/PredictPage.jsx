// Save this as: src/App.jsx in your Vite frontend
// Enhanced version with multi-model support

import { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  User,
  AlertTriangle,
  CheckCircle,
  Brain,
  Wifi,
  WifiOff,
  BarChart3,
  Trophy,
  Target,
  Clock,
} from "lucide-react";
import LoadingSpinner from './components/LoadingSpinner';
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [modelInfo, setModelInfo] = useState(null);
  const [modelComparison, setModelComparison] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch("/api/model/info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend connected:", data);
        setBackendStatus("connected");
        setModelInfo(data);
      } else {
        throw new Error("Backend not responding");
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setBackendStatus("disconnected");
    }
  };

  const fetchModelComparison = async () => {
    try {
      const response = await fetch("/api/model/comparison");
      if (response.ok) {
        const data = await response.json();
        setModelComparison(data);
        setShowComparison(true);
      }
    } catch (error) {
      console.error("Error fetching model comparison:", error);
    }
  };

  // API call to Flask backend
  const predictHeartDisease = async (data) => {
    try {
      console.log("🔄 Sending prediction request...", data);

      const response = await fetch("/api/predict/kb22", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Prediction received:", result);

      return {
        prediction: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
        model: result.model_info?.algorithm || "Enhanced Model",
        accuracy: result.model_info?.accuracy || "N/A",
        risk_level: result.risk_level,
        recommendation: result.recommendation,
        risk:
          result.prediction === 1
            ? "High Risk - Heart Disease Detected"
            : "Low Risk - No Heart Disease",
        riskLevel: result.prediction === 1 ? "High" : "Low",
        probabilities: result.probabilities || {},
        model_info: result.model_info || {}
      };
    } catch (error) {
      console.error("❌ Prediction failed:", error);
      throw new Error(
        `Connection failed: ${error.message}. Make sure the Flask server is running on http://localhost:5000`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const validateInput = () => {
    const required = [
      "age",
      "sex",
      "cp",
      "trestbps",
      "chol",
      "fbs",
      "restecg",
      "thalach",
      "exang",
      "oldpeak",
      "slope",
      "ca",
      "thal",
    ];
    const missing = required.filter(
      (field) => !formData[field] && formData[field] !== "0"
    );

    if (missing.length > 0) {
      throw new Error(
        `Please fill in all required fields. Missing: ${missing.join(", ")}`
      );
    }

    const age = parseInt(formData.age);
    const trestbps = parseInt(formData.trestbps);
    const chol = parseInt(formData.chol);
    const thalach = parseInt(formData.thalach);
    const oldpeak = parseFloat(formData.oldpeak);

    if (age < 1 || age > 120) {
      throw new Error("Age must be between 1 and 120 years");
    }
    if (trestbps < 50 || trestbps > 300) {
      throw new Error("Blood pressure must be between 50 and 300 mmHg");
    }
    if (chol < 100 || chol > 600) {
      throw new Error("Cholesterol must be between 100 and 600 mg/dl");
    }
    if (thalach < 50 || thalach > 220) {
      throw new Error("Maximum heart rate must be between 50 and 220 bpm");
    }
    if (oldpeak < 0 || oldpeak > 10) {
      throw new Error("ST Depression must be between 0.0 and 10.0");
    }
  };

  const handleSubmit = async () => {
    if (backendStatus !== "connected") {
      setError(
        "Backend server is not connected. Please check if Flask server is running on http://localhost:5000"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      validateInput();

      const numericData = {};
      Object.keys(formData).forEach((key) => {
        if (key === "oldpeak") {
          numericData[key] = parseFloat(formData[key]);
        } else {
          numericData[key] = parseInt(formData[key]);
        }
      });

      console.log("📤 Processed data:", numericData);

      const result = await predictHeartDisease(numericData);
      setPrediction(result);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
      console.error("❌ Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: "",
      sex: "",
      cp: "",
      trestbps: "",
      chol: "",
      fbs: "",
      restecg: "",
      thalach: "",
      exang: "",
      oldpeak: "",
      slope: "",
      ca: "",
      thal: "",
    });
    setPrediction(null);
    setShowResults(false);
    setShowComparison(false);
    setError(null);
  };

  const loadSampleData = () => {
    setFormData({
      age: "54",
      sex: "1",
      cp: "0",
      trestbps: "150",
      chol: "250",
      fbs: "0",
      restecg: "1",
      thalach: "140",
      exang: "1",
      oldpeak: "3.0",
      slope: "1",
      ca: "1",
      thal: "3",
    });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-10 h-10 text-blue-600 mr-3" />
            <Heart className="w-10 h-10 text-red-500 mr-3" />
            <Trophy className="w-10 h-10 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              KB22 Enhanced Heart Disease Predictor
            </h1>
          </div>
          <p className="text-gray-600 max-w-4xl mx-auto mb-2">
            {modelInfo ? 
              `${modelInfo.best_model?.name || 'Multi-Algorithm System'} • ${
                modelInfo.best_model?.accuracy ? 
                (modelInfo.best_model.accuracy * 100).toFixed(1) + '% Accuracy' : 
                'Enhanced Accuracy'
              } • UCI Heart Disease Dataset`
              : 'Multi-Algorithm ML System • Enhanced Accuracy • UCI Dataset'
            }
          </p>
          <p className="text-sm text-gray-500">
            {modelInfo ? 
              `Best of ${Object.keys(modelInfo.dataset_info || {}).length > 0 ? 
                '8+ ML Models' : 'Multiple Models'} • React + Vite & Flask • Advanced Prediction System`
              : 'Advanced ML Comparison System • Multiple Algorithms Tested'
            }
          </p>
        </div>

        {/* Backend Connection Status with Model Info */}
        <div
          className={`rounded-lg shadow-sm p-4 mb-6 border-l-4 ${
            backendStatus === "connected"
              ? "bg-green-50 border-green-500"
              : backendStatus === "disconnected"
              ? "bg-red-50 border-red-500"
              : "bg-yellow-50 border-yellow-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {backendStatus === "connected" ? (
                <Wifi className="w-5 h-5 text-green-600 mr-3" />
              ) : backendStatus === "disconnected" ? (
                <WifiOff className="w-5 h-5 text-red-600 mr-3" />
              ) : (
                <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              )}
              <div>
                <span
                  className={`text-sm font-medium ${
                    backendStatus === "connected"
                      ? "text-green-800"
                      : backendStatus === "disconnected"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  Backend Status:{" "}
                  {backendStatus === "connected"
                    ? "Connected to Enhanced KB22 API ✅"
                    : backendStatus === "disconnected"
                    ? "Disconnected ❌"
                    : "Checking connection..."}
                </span>
                {modelInfo && backendStatus === "connected" && (
                  <div className="text-xs text-gray-600 mt-1">
                    Active Model: {modelInfo.best_model?.name || 'Loading...'} • 
                    Accuracy: {modelInfo.best_model?.accuracy ? 
                      (modelInfo.best_model.accuracy * 100).toFixed(2) + '%' : 'N/A'
                    } • 
                    Trained on {modelInfo.dataset_info?.samples || 'N/A'} samples
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkBackendConnection}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm transition duration-200"
              >
                Refresh
              </button>
              {backendStatus === "connected" && (
                <button
                  onClick={fetchModelComparison}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-md text-sm transition duration-200 flex items-center"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Model Comparison
                </button>
              )}
              <button
                onClick={loadSampleData}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm transition duration-200"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Model Comparison Modal */}
        {showComparison && modelComparison && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">
                  ML Model Comparison Results
                </h2>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-gold-500 to-yellow-600 rounded-lg p-4 text-white text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Best Model</h3>
                <p className="text-lg font-bold">{modelComparison.best_model}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Models Tested</h3>
                <p className="text-lg font-bold">{modelComparison.total_models_tested}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Dataset Size</h3>
                <p className="text-lg font-bold">
                  {modelComparison.dataset_info?.samples || 'N/A'} samples
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold">Rank</th>
                    <th className="text-left p-3 font-semibold">Model</th>
                    <th className="text-left p-3 font-semibold">Accuracy</th>
                    <th className="text-left p-3 font-semibold">Precision</th>
                    <th className="text-left p-3 font-semibold">Recall</th>
                    <th className="text-left p-3 font-semibold">F1-Score</th>
                    <th className="text-left p-3 font-semibold">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison.comparison_results.slice(0, 8).map((model, index) => (
                    <tr 
                      key={index} 
                      className={`border-b ${index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-3">
                        {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 inline mr-1" />}
                        #{model.rank}
                      </td>
                      <td className="p-3 font-medium">{model.model_name}</td>
                      <td className="p-3">{(model.accuracy * 100).toFixed(2)}%</td>
                      <td className="p-3">{(model.precision * 100).toFixed(2)}%</td>
                      <td className="p-3">{(model.recall * 100).toFixed(2)}%</td>
                      <td className="p-3">{(model.f1_score * 100).toFixed(2)}%</td>
                      <td className="p-3">
                        {model.roc_auc ? (model.roc_auc * 100).toFixed(2) + '%' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Comparison completed on: {new Date(modelComparison.comparison_timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!showResults ? (
          /* Input Form */
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Demographics Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Demographics
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="29-77"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sex *
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chest Pain Type *
                    </label>
                    <select
                      name="cp"
                      value={formData.cp}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="0">Typical Angina</option>
                      <option value="1">Atypical Angina</option>
                      <option value="2">Non-anginal Pain</option>
                      <option value="3">Asymptomatic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resting Blood Pressure *
                    </label>
                    <input
                      type="number"
                      name="trestbps"
                      value={formData.trestbps}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="94-200 mm Hg"
                      min="50"
                      max="300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cholesterol *
                    </label>
                    <input
                      type="number"
                      name="chol"
                      value={formData.chol}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="126-564 mg/dl"
                      min="100"
                      max="600"
                      required
                    />
                  </div>
                </div>

                {/* Clinical Tests Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Clinical Tests
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fasting Blood Sugar &gt;120 mg/dl *
                    </label>
                    <select
                      name="fbs"
                      value={formData.fbs}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">True</option>
                      <option value="0">False</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resting ECG *
                    </label>
                    <select
                      name="restecg"
                      value={formData.restecg}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select result</option>
                      <option value="0">Normal</option>
                      <option value="1">ST-T wave abnormality</option>
                      <option value="2">Left ventricular hypertrophy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Heart Rate *
                    </label>
                    <input
                      type="number"
                      name="thalach"
                      value={formData.thalach}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="71-202 bpm"
                      min="50"
                      max="220"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise Induced Angina *
                    </label>
                    <select
                      name="exang"
                      value={formData.exang}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ST Depression (oldpeak) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="oldpeak"
                      value={formData.oldpeak}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0-6.2"
                      min="0"
                      max="10"
                      required
                    />
                  </div>
                </div>

                {/* Advanced Features Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Advanced Features
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ST Slope *
                    </label>
                    <select
                      name="slope"
                      value={formData.slope}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select slope</option>
                      <option value="0">Upsloping</option>
                      <option value="1">Flat</option>
                      <option value="2">Downsloping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Major Vessels *
                    </label>
                    <select
                      name="ca"
                      value={formData.ca}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select count</option>
                      <option value="0">0 vessels</option>
                      <option value="1">1 vessel</option>
                      <option value="2">2 vessels</option>
                      <option value="3">3 vessels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thalassemia *
                    </label>
                    <select
                      name="thal"
                      value={formData.thal}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="1">Normal</option>
                      <option value="2">Fixed Defect</option>
                      <option value="3">Reversible Defect</option>
                    </select>
                  </div>

                  {/* Enhanced Info Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mt-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      Enhanced ML System
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      This system tests 8+ ML algorithms and automatically selects the best performer for your prediction.
                    </p>
                    <div className="text-xs text-blue-600">
                      {modelInfo && (
                        <div className="space-y-1">
                          <p>• Current Best: {modelInfo.best_model?.name || 'Loading...'}</p>
                          <p>• Accuracy: {modelInfo.best_model?.accuracy ? 
                            (modelInfo.best_model.accuracy * 100).toFixed(1) + '%' : 'N/A'}</p>
                          <p>• Dataset: {modelInfo.dataset_info?.samples || 'N/A'} UCI samples</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading || backendStatus !== "connected"}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-md transition duration-200 flex items-center justify-center text-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Running Enhanced ML Analysis...
                    </>
                  ) : backendStatus !== "connected" ? (
                    <>
                      <WifiOff className="w-6 h-6 mr-3" />
                      Backend Disconnected - Check Flask Server
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6 mr-3" />
                      Predict with Best ML Model ({modelInfo?.best_model?.name || 'Enhanced System'})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Results Display */
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Enhanced KB22 ML Prediction Results
              </h2>
              <p className="text-gray-600">
                {prediction.model} • {prediction.accuracy} • Best of Multiple Models
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div
                className={`rounded-lg p-6 text-white text-center ${
                  prediction.prediction === 1
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">Prediction</h3>
                <div className="text-2xl font-bold flex items-center justify-center">
                  {prediction.prediction === 1 ? (
                    <AlertTriangle className="w-8 h-8 mr-2" />
                  ) : (
                    <CheckCircle className="w-8 h-8 mr-2" />
                  )}
                  {prediction.prediction === 1 ? "POSITIVE" : "NEGATIVE"}
                </div>
                <p className="text-sm mt-1 opacity-90">{prediction.risk}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Risk Level</h3>
                <div className="text-2xl font-bold">
                  {prediction.risk_level || 'Unknown'}
                </div>
                <p className="text-sm mt-1 opacity-90">
                  {Math.round(prediction.probability * 100)}% Probability
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Best Model</h3>
                <div className="text-lg font-bold">{prediction.model}</div>
                <p className="text-sm mt-1 opacity-90">
                  {prediction.accuracy}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Confidence</h3>
                <div className="text-3xl font-bold">
                  {Math.round(prediction.confidence * 100)}%
                </div>
                <p className="text-sm mt-1 opacity-90">Model Certainty</p>
              </div>
            </div>

            {/* Enhanced Detailed Probabilities */}
            {prediction.probabilities && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Detailed Risk Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        No Heart Disease
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round((prediction.probabilities.no_heart_disease || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(prediction.probabilities.no_heart_disease || 0) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">Healthy heart likelihood</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        Heart Disease Risk
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {Math.round((prediction.probabilities.heart_disease || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(prediction.probabilities.heart_disease || 0) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">Disease presence likelihood</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Recommendations */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Clinical Recommendations
              </h3>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                <p className="text-gray-700 font-medium mb-2">AI-Generated Recommendation:</p>
                <p className="text-gray-600">{prediction.recommendation}</p>
              </div>
              
              {prediction.prediction === 1 ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="mb-3 font-semibold text-red-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    HIGH RISK - Immediate Medical Attention Required
                  </p>
                  <div className="space-y-2 text-red-700 text-sm">
                    <p>• Schedule immediate consultation with a cardiologist</p>
                    <p>• Consider additional cardiac testing (ECG, stress test, echocardiogram)</p>
                    <p>• Begin lifestyle modifications immediately</p>
                    <p>• Monitor blood pressure and cholesterol closely</p>
                    <p>• Discuss medication options with healthcare provider</p>
                    <p>• Consider cardiac rehabilitation programs</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="mb-3 font-semibold text-green-800 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    LOW RISK - Continue Preventive Care
                  </p>
                  <div className="space-y-2 text-green-700 text-sm">
                    <p>• Maintain current healthy lifestyle practices</p>
                    <p>• Continue regular cardiovascular health screenings</p>
                    <p>• Keep up with balanced diet and regular exercise</p>
                    <p>• Monitor risk factors periodically</p>
                    <p>• Follow up with healthcare provider as scheduled</p>
                    <p>• Consider annual cardiac risk assessments</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Model Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Enhanced ML Model Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Selected Algorithm:</span>
                    <span className="text-blue-900 font-semibold">{prediction.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Model Accuracy:</span>
                    <span className="text-blue-900 font-semibold">{prediction.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Dataset Source:</span>
                    <span className="text-blue-900">UCI Heart Disease</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Training Samples:</span>
                    <span className="text-blue-900">{prediction.model_info?.trained_on || '303 patients'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">System Type:</span>
                    <span className="text-blue-900">Multi-Algorithm Comparison</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Models Tested:</span>
                    <span className="text-blue-900">8+ Algorithms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Selection Method:</span>
                    <span className="text-blue-900">Best Performance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Prediction Confidence:</span>
                    <span className="text-blue-900 font-semibold">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <User className="w-5 h-5 mr-2" />
                New Patient Analysis
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Model Comparison
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                Print Medical Report
              </button>
            </div>

            {/* Enhanced Medical Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-2">
                    ENHANCED ML SYSTEM DISCLAIMER
                  </p>
                  <p className="text-yellow-700 mb-2">
                    This enhanced system uses multiple machine learning algorithms to provide the most accurate prediction possible. 
                    The system automatically selects the best-performing model from comprehensive testing.
                  </p>
                  <p className="text-yellow-700">
                    <strong>Medical Disclaimer:</strong> This is a demonstration of advanced ML techniques for educational purposes. 
                    This tool should not replace professional medical advice, diagnosis, or treatment. 
                    Always consult qualified healthcare providers for medical decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;