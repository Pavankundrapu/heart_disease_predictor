// Save this as: src/App.jsx in your Vite frontend
// Replace the entire contents of App.jsx with this code

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
} from "lucide-react";
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
      } else {
        throw new Error("Backend not responding");
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setBackendStatus("disconnected");
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
        model: "K-Neighbors Classifier",
        accuracy: "87%",
        risk:
          result.prediction === 1
            ? "High Risk - Heart Disease Detected"
            : "Low Risk - No Heart Disease",
        riskLevel: result.prediction === 1 ? "High" : "Low",
        probabilities: result.probabilities || {},
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

    // Clear error when user starts typing
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

    // Basic range validation
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
      // Validate input
      validateInput();

      // Convert form data to numbers
      const numericData = {};
      Object.keys(formData).forEach((key) => {
        if (key === "oldpeak") {
          numericData[key] = parseFloat(formData[key]);
        } else {
          numericData[key] = parseInt(formData[key]);
        }
      });

      console.log("📤 Processed data:", numericData);

      // Make prediction
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-10 h-10 text-blue-600 mr-3" />
            <Heart className="w-10 h-10 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              KB22 Heart Disease Predictor
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto mb-2">
            UCI Heart Disease Dataset • K-Neighbors Classifier • 87% Accuracy
          </p>
          <p className="text-sm text-gray-500">
            Built with React + Vite & Flask • Enter clinical data to predict
            heart disease risk
          </p>
        </div>

        {/* Backend Connection Status */}
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
                  ? "Connected to Flask API ✅"
                  : backendStatus === "disconnected"
                  ? "Disconnected ❌"
                  : "Checking connection..."}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkBackendConnection}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm transition duration-200"
              >
                Refresh
              </button>
              <button
                onClick={loadSampleData}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm transition duration-200"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>

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
          <div className="bg-white rounded-lg shadow-lg p-6">
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
                      Fasting Blood Sugar &gt;{/* > */ }120 mg/dl *
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

                  {/* Info Box */}
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      UCI Dataset Features
                    </h4>
                    <p className="text-sm text-blue-700">
                      This form uses all 13 input features from the UCI Heart
                      Disease dataset, exactly as used in the KB22 model for
                      maximum accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading || backendStatus !== "connected"}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-md transition duration-200 flex items-center justify-center text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Running K-Neighbors Analysis...
                    </>
                  ) : backendStatus !== "connected" ? (
                    <>
                      <WifiOff className="w-6 h-6 mr-3" />
                      Backend Disconnected - Check Flask Server
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6 mr-3" />
                      Predict with KB22 Model (87% Accuracy)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Display */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                KB22 Model Prediction Results
              </h2>
              <p className="text-gray-600">
                {prediction.model} • {prediction.accuracy} Accuracy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <h3 className="text-lg font-semibold mb-2">Confidence Score</h3>
                <div className="text-3xl font-bold">
                  {Math.round(prediction.probability * 100)}%
                </div>
                <p className="text-sm mt-1 opacity-90">
                  Heart Disease Probability
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-2">Model Accuracy</h3>
                <div className="text-3xl font-bold">{prediction.accuracy}</div>
                <p className="text-sm mt-1 opacity-90">
                  K-Neighbors Classifier
                </p>
              </div>
            </div>

            {/* Detailed Probabilities */}
            {prediction.probabilities && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Detailed Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        No Heart Disease
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {Math.round(
                          (prediction.probabilities.no_heart_disease || 0) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (prediction.probabilities.no_heart_disease || 0) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Heart Disease
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {Math.round(
                          (prediction.probabilities.heart_disease || 0) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (prediction.probabilities.heart_disease || 0) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Clinical Recommendations
              </h3>
              {prediction.prediction === 1 ? (
                <div className="text-red-700">
                  <p className="mb-3 font-semibold">
                    ⚠️ POSITIVE for Heart Disease - Immediate Action Required
                  </p>
                  <div className="space-y-2">
                    <p>• Schedule immediate consultation with a cardiologist</p>
                    <p>
                      • Consider additional cardiac testing (ECG, stress test,
                      echocardiogram)
                    </p>
                    <p>• Begin lifestyle modifications immediately</p>
                    <p>• Monitor blood pressure and cholesterol closely</p>
                    <p>• Discuss medication options with healthcare provider</p>
                  </div>
                </div>
              ) : (
                <div className="text-green-700">
                  <p className="mb-3 font-semibold">
                    ✅ NEGATIVE for Heart Disease - Continue Preventive Care
                  </p>
                  <div className="space-y-2">
                    <p>• Maintain current healthy lifestyle practices</p>
                    <p>• Continue regular cardiovascular health screenings</p>
                    <p>• Keep up with balanced diet and regular exercise</p>
                    <p>• Monitor risk factors periodically</p>
                    <p>• Follow up with healthcare provider as scheduled</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                About This Prediction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p>
                    <strong>Dataset:</strong> UCI Heart Disease (Cleveland)
                  </p>
                  <p>
                    <strong>Features:</strong> 13 clinical parameters
                  </p>
                  <p>
                    <strong>Training Size:</strong> 303 patients
                  </p>
                  <p>
                    <strong>Technology:</strong> React + Vite + Flask
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Algorithm:</strong> K-Neighbors Classifier
                  </p>
                  <p>
                    <strong>Validation Accuracy:</strong> 87%
                  </p>
                  <p>
                    <strong>Model Source:</strong> kb22/Heart-Disease-Prediction
                  </p>
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {Math.round(prediction.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <User className="w-5 h-5 mr-2" />
                New Patient Analysis
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                Print Medical Report
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center bg-gray-50 p-4 rounded">
              <p className="mb-1">
                ⚠️ MEDICAL DISCLAIMER: This is a demonstration of the KB22
                machine learning model.
              </p>
              <p>
                This tool should not replace professional medical advice,
                diagnosis, or treatment. Always consult qualified healthcare
                providers for medical decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
