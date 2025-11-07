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
  Mail,
} from "lucide-react";
import LoadingSpinner from './components/LoadingSpinner';
import RiskGauge from './components/RiskGauge';
import LifestyleTracker from './components/LifestyleTracker';
import EmailReportModal from './components/EmailReportModal';
import PatientDataComparison from './components/PatientDataComparison';
import "./App.css";
import { jsPDF } from 'jspdf';
import emailjs from 'emailjs-com';
import Papa from 'papaparse';

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
  const [emailModal, setEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [datasetStats, setDatasetStats] = useState(null);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
    fetchDatasetStatistics();
  }, []);

  const fetchDatasetStatistics = async () => {
    try {
      const response = await fetch("/api/dataset/statistics");
      if (response.ok) {
        const data = await response.json();
        setDatasetStats(data);
      }
    } catch (error) {
      console.error("Error fetching dataset statistics:", error);
    }
  };

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

  const handleCsvUpload = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;
          if (!rows || rows.length === 0) {
            setError('CSV appears empty. Include a header row and at least one data row.');
            return;
          }
          const row = rows[0];
          const fieldNames = [
            'age','sex','cp','trestbps','chol','fbs','restecg','thalach','exang','oldpeak','slope','ca','thal'
          ];
          const normalized = {};
          // Basic header normalization: lowercase, trim
          const normRow = {};
          Object.keys(row).forEach(k => {
            normRow[k.trim().toLowerCase()] = row[k];
          });
          // Allow a few common synonyms
          const alias = {
            'restingbp': 'trestbps',
            'resting_bp': 'trestbps',
            'cholesterol': 'chol',
            'maxhr': 'thalach',
            'max_heart_rate': 'thalach',
          };
          const convertValue = (field, val) => {
            if (val === undefined || val === null || val === '') return undefined;
            const raw = String(val).trim();
            const num = Number(raw);
            switch (field) {
              case 'cp': {
                if (!Number.isNaN(num)) {
                  const mapped = Math.max(0, Math.min(3, Math.round(num) - 1));
                  return String(mapped);
                }
                break;
              }
              case 'slope': {
                if (!Number.isNaN(num)) {
                  const mapped = Math.max(0, Math.min(2, Math.round(num) - 1));
                  return String(mapped);
                }
                break;
              }
              case 'thal': {
                if (!Number.isNaN(num)) {
                  const map = { 3: '1', 6: '2', 7: '3', 1: '1', 2: '2' };
                  if (map[num] !== undefined) return map[num];
                }
                break;
              }
              default:
                if (!Number.isNaN(num)) return String(num);
                return raw;
            }
            return raw;
          };

          fieldNames.forEach((f) => {
            const key = f;
            const aliasKey = Object.keys(alias).find(a => alias[a]===f);
            const sourceVal = normRow[key] ?? (aliasKey ? normRow[aliasKey] : undefined);
            const converted = convertValue(f, sourceVal);
            if (converted !== undefined) {
              normalized[f] = converted;
            }
          });
          if (Object.keys(normalized).length === 0) {
            setError('CSV headers must include at least some of: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal');
            return;
          }
          setFormData((prev) => ({ ...prev, ...normalized }));
          setError(null);
        } catch (e) {
          setError('Failed to parse CSV: ' + (e.message || 'Unknown error'));
        }
      },
      error: (e) => {
        setError('CSV parse error: ' + (e.message || 'Unknown error'));
      }
    });
  };

  const handlePdfDownload = () => {
    if (!prediction) return;
    const doc = new jsPDF();
    doc.setFont('helvetica','bold');
    doc.setFontSize(18);
    doc.text('Heart Disease Prediction Report', 10, 18);
    doc.setFontSize(13);
    doc.setFont('helvetica','normal');
    const yStart = 30;
    doc.text(`Date: ${new Date().toLocaleString()}`, 10, yStart);
    doc.text(`Patient Age: ${formData.age}`, 10, yStart+10);
    doc.text(`Sex: ${formData.sex==='1'?'Male':'Female'}`, 10, yStart+20);
    // Main results
    doc.setFontSize(14); doc.setTextColor(88,64,220);
    doc.text(`Risk Score: ${(prediction.probability*100).toFixed(1)}% [${prediction.risk_level}]`, 10, yStart+32);
    doc.setTextColor(0,0,0);
    doc.setFontSize(12);
    doc.text(`Result: ${prediction.prediction===1? 'POSITIVE (Heart Disease Detected)':'NEGATIVE (No Heart Disease)'}`, 10, yStart+42);
    doc.text(`Model Used: ${prediction.model}`, 10, yStart+52);
    doc.text(`Accuracy: ${prediction.accuracy}`, 10, yStart+62);
    doc.setFont('helvetica','bold');
    doc.text('Recommendations:', 10, yStart+76);
    doc.setFont('helvetica','normal');
    doc.setFontSize(11);
    let recLines = doc.splitTextToSize(prediction.recommendation || '',170);
    doc.text(recLines, 10, yStart+84);
    doc.setFontSize(9);
    doc.setTextColor(160,160,160);
    doc.text('Disclaimer: This report is informational and does not replace medical advice.', 10, 280);
    doc.save(`heart-disease-report-${Date.now()}.pdf`);
  };

  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const getSummaryText = () => `KB22 Heart Disease Report\n\nDate: ${new Date().toLocaleString()}\nPatient Age: ${formData.age}\nSex: ${formData.sex==='1'?'Male':'Female'}\nRisk Score: ${(prediction.probability*100).toFixed(1)}% [${prediction.risk_level}]\nResult: ${prediction.prediction===1? 'POSITIVE (Heart Disease Detected)':'NEGATIVE (No Heart Disease)'}\nModel Used: ${prediction.model}\nAccuracy: ${prediction.accuracy}\n\nRecommendations:\n${prediction.recommendation}`;

  const generateHealthImprovements = () => {
    if (!prediction) return [];

    const tips = [];
    const pushTip = (tip) => {
      if (tip && !tips.includes(tip)) {
        tips.push(tip);
      }
    };

    const ageNum = Number(formData.age) || 0;
    const bp = Number(formData.trestbps) || 0;
    const chol = Number(formData.chol) || 0;
    const fbs = Number(formData.fbs);
    const thalach = Number(formData.thalach) || 0;
    const exang = Number(formData.exang);
    const oldpeak = Number(formData.oldpeak) || 0;
    const slope = Number(formData.slope);
    const ca = Number(formData.ca);
    const thal = Number(formData.thal);
    const cp = Number(formData.cp);
    const riskLevel = (prediction.risk_level || '').toLowerCase();
    const riskProbability = prediction.probability || 0;

    // Baseline actions based on model output
    if (prediction.prediction === 1 || riskLevel.includes('high')) {
      pushTip('Book a consultation with a cardiologist within the next 1–2 weeks to review these findings and plan further testing.');
      pushTip('Begin medically supervised activity such as short, low-intensity walks; avoid overexertion until cleared.');
      pushTip('Adopt a DASH or Mediterranean-style eating pattern emphasizing vegetables, legumes, whole grains, lean proteins, and limiting trans/saturated fats.');
    } else {
      pushTip('Continue heart-healthy habits: at least 150 minutes/week of moderate aerobic exercise plus two strength sessions.');
      pushTip('Keep a balanced eating pattern rich in fiber (25–30g/day) and low in ultra-processed foods and added sugars.');
      pushTip('Maintain stress-reduction routines (mindfulness, deep breathing, yoga) and target 7–8 hours of quality sleep.');
    }

    if (riskProbability >= 0.75) {
      pushTip('Discuss advanced diagnostics (stress test, echocardiogram, or coronary CT) with your cardiologist given the elevated predicted risk.');
      pushTip('Review current medications with your physician; aggressive risk-factor management may be indicated.');
    } else if (riskProbability >= 0.55) {
      pushTip('Track blood pressure, resting heart rate, and symptoms weekly; share the log at your next clinical visit.');
    }

    // Blood pressure and cholesterol
    if (bp >= 130) {
      pushTip('Limit sodium to <1500 mg/day by cooking at home, reading labels, and avoiding cured/processed foods.');
      pushTip('Measure blood pressure at home 4–5 times per week (morning/evening) and bring readings to your clinician.');
    }
    if (chol >= 240) {
      pushTip('Reduce saturated fat intake (fatty meats, full-fat dairy) and include plant-based omega-3 sources (walnuts, flax, chia).');
      pushTip('Add soluble fiber (oats, barley, beans) daily to lower LDL cholesterol; consider discussing statin therapy.');
    }

    // Glucose handling
    if (fbs === 1) {
      pushTip('Moderate refined carbohydrate intake; emphasize protein and fiber in each meal to stabilize blood glucose.');
      pushTip('Schedule fasting glucose or HbA1c monitoring; coordinate with your primary care provider/endocrinologist.');
    }

    // Symptom-oriented suggestions
    if (cp === 2 || cp === 3) { // non-anginal / asymptomatic in UI scale
      pushTip('Even with minimal chest pain, report any new pressure, heaviness, or shortness of breath to your doctor immediately.');
    } else if (cp === 0 || cp === 1) {
      pushTip('Document triggers, duration, and intensity of chest discomfort; share this log during appointments.');
    }

    if (exang === 1) {
      pushTip('Avoid vigorous unmonitored exercise. Ask about enrolling in a cardiac rehabilitation or supervised exercise program.');
    }
    if (oldpeak >= 2) {
      pushTip('Elevated ST depression warrants timely review—seek medical attention if exercise causes chest pain or dizziness.');
      pushTip('Focus on low-impact activities such as stationary cycling or aquatic exercise until cleared for higher intensity.');
    }
    if (thalach && thalach < 100) {
      pushTip('Gradually build aerobic capacity: start with 10-minute walks 3x/day, increasing total duration by 5 minutes each week.');
    }

    // Anatomic markers
    if (ca >= 1) {
      pushTip('Coronary vessel involvement suggests a need for aggressive risk-factor control; adhere strictly to medication plans.');
    }
    if (thal === 2 || thal === 3) {
      pushTip('Abnormal thallium imaging results—ensure follow-up testing is completed and review results with a cardiologist.');
    }

    if (slope === 1 || slope === 2) {
      pushTip('Discuss exercise stress-test findings with your doctor; altered ST slope may indicate ischemia needing targeted therapy.');
    }

    if (ageNum >= 60) {
      pushTip('Incorporate balance and strength exercises (chair stands, heel-to-toe walking) to improve cardiovascular and functional health.');
    }

    // Lifestyle reinforcement
    pushTip('Stay hydrated and limit alcohol consumption (≤1 drink/day for women, ≤2 for men).');
    pushTip('Schedule routine follow-ups every 3–6 months to reassess risk factors, labs, and medication effectiveness.');

    return tips.slice(0, 12);
  };

  const handleSendEmail = async (recipient) => {
    setEmailError(''); setEmailSending(true);
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
        throw new Error('Email service is not configured. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env');
      }
      const params = {
        to_email: recipient,
        report_summary: getSummaryText(),
        patient_age: formData.age,
        risk_percent: (prediction.probability*100).toFixed(1),
        result: prediction.prediction===1? 'POSITIVE':'NEGATIVE',
        recommendations: prediction.recommendation
      };
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        params,
        EMAILJS_USER_ID
      );
      setEmailSending(false); setEmailSent(true);
      setTimeout(()=>{setEmailModal(false); setEmailSent(false);}, 2200);
    } catch (e) {
      setEmailError('Could not send email: ' + (e.text || e.message));
      setEmailSending(false);
    }
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
              {/* CSV Uploader */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-900 mb-2">Load from CSV</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e)=> handleCsvUpload(e.target.files && e.target.files[0])}
                    className="block w-full text-sm text-blue-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Expected headers: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal. Only the first row will be used.
                </p>
              </div>
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
                      title="Age of the patient in years. Higher age increases risk."
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
                      title="Patient's biological sex: 0 = Female, 1 = Male. Risk profile differs by sex."
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
                      title="Chest pain type: 0 = Typical Angina, 1 = Atypical, 2 = Non-anginal, 3 = Asymptomatic."
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
                      title="Resting blood pressure (mm Hg). High values indicate hypertension risk."
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
                      title="Serum cholesterol (mg/dl). Elevated cholesterol is a major risk factor."
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
                      title="Fasting blood sugar > 120 mg/dl: 1 = Yes, 0 = No. High fasting sugar increases risk."
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
                      title="Resting ECG results: 0 = Normal, 1 = ST-T abnormality, 2 = Left ventricular hypertrophy."
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
                      title="Maximum heart rate achieved (bpm). Low values may indicate heart issues."
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
                      title="Exercise induced angina: 1 = Yes, 0 = No. Indicates chest pain on exertion."
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
                      title="ST depression induced by exercise relative to rest. Higher = more severe myocardial ischemia."
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
                      title="Slope of the ST segment: 0 = Upsloping, 1 = Flat, 2 = Downsloping."
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
                      title="Major vessels colored by fluoroscopy. 0–3 vessels. More vessels = higher risk."
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
                      title="Type of Thalassemia: 1 = Normal, 2 = Fixed defect, 3 = Reversible defect."
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
                <div className="mt-4 flex items-center justify-center">
                  <RiskGauge score={prediction.probability} label="Your Risk Score" size={120} />
                </div>
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

            {/* Patient Data Comparison with Dataset Statistics */}
            {showResults && prediction && datasetStats && (
              <div className="mb-6">
                <PatientDataComparison patientData={formData} datasetStats={datasetStats} />
              </div>
            )}


            {/* Personalized Health Improvements */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Personalized Health Improvements
              </h3>
              <p className="text-sm text-gray-600 mb-3">Based on your inputs and risk profile, consider the following actions:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {generateHealthImprovements().map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Enhanced Model Information */}
            <LifestyleTracker riskLevel={prediction.risk_level} />
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
                onClick={handlePdfDownload}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                Download PDF Report
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                Print Medical Report
              </button>
              <button
                onClick={()=>setEmailModal(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Report by Email
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
      <EmailReportModal
        open={emailModal}
        onClose={()=>{ if(!emailSending) {setEmailModal(false);setEmailError('');} }}
        onSend={handleSendEmail}
        loading={emailSending}
        error={emailError || (emailSent? 'Email sent! ✅':'')}
      />
    </div>
  );
}

export default App;