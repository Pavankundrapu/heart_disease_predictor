import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Users, BarChart3, TrendingUp, ArrowUpDown } from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

const DoctorsDashboard = () => {
  const [csvData, setCsvData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          return;
        }
        setCsvData(results.data);
        setError(null);
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const processBatchPredictions = async () => {
    if (!csvData || csvData.length === 0) {
      setError('No data to process');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = [];
      
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const patientData = {
          age: parseInt(row.age) || 0,
          sex: parseInt(row.sex) || 0,
          cp: parseInt(row.cp) || 0,
          trestbps: parseInt(row.trestbps) || 0,
          chol: parseInt(row.chol) || 0,
          fbs: parseInt(row.fbs) || 0,
          restecg: parseInt(row.restecg) || 0,
          thalach: parseInt(row.thalach) || 0,
          exang: parseInt(row.exang) || 0,
          oldpeak: parseFloat(row.oldpeak) || 0,
          slope: parseInt(row.slope) || 0,
          ca: parseInt(row.ca) || 0,
          thal: parseInt(row.thal) || 0,
        };

        try {
          const response = await fetch('/api/predict/kb22', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData),
          });

          if (response.ok) {
            const result = await response.json();
            results.push({
              patientId: row.id || `P${i + 1}`,
              ...patientData,
              prediction: result.prediction === 1 ? 'High Risk' : 'Low Risk',
              probability: (result.probability * 100).toFixed(1),
              riskLevel: result.risk_level,
              confidence: (result.confidence * 100).toFixed(1),
            });
          } else {
            results.push({
              patientId: row.id || `P${i + 1}`,
              ...patientData,
              prediction: 'Error',
              probability: 'N/A',
              riskLevel: 'N/A',
              confidence: 'N/A',
            });
          }
        } catch (err) {
          results.push({
            patientId: row.id || `P${i + 1}`,
            ...patientData,
            prediction: 'Error',
            probability: 'N/A',
            riskLevel: 'N/A',
            confidence: 'N/A',
          });
        }
      }

      setPredictions(results);
    } catch (err) {
      setError(`Batch processing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...predictions].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setPredictions(sorted);
  };

  const exportToPDF = () => {
    if (predictions.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Batch Prediction Report', 10, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 30);
    doc.text(`Total Patients: ${predictions.length}`, 10, 40);

    const highRisk = predictions.filter(p => p.prediction === 'High Risk').length;
    const lowRisk = predictions.filter(p => p.prediction === 'Low Risk').length;

    doc.text(`High Risk: ${highRisk}`, 10, 50);
    doc.text(`Low Risk: ${lowRisk}`, 10, 60);

    let y = 75;
    doc.setFontSize(10);
    predictions.forEach((p, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${idx + 1}. Patient ${p.patientId}: ${p.prediction} (${p.probability}%)`, 10, y);
      y += 7;
    });

    doc.save('batch_prediction_report.pdf');
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'High Risk' || riskLevel?.includes('High')) return 'text-red-600 bg-red-50';
    if (riskLevel === 'Moderate Risk' || riskLevel?.includes('Moderate')) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const stats = {
    total: predictions.length,
    highRisk: predictions.filter(p => p.prediction === 'High Risk').length,
    lowRisk: predictions.filter(p => p.prediction === 'Low Risk').length,
    avgProbability: predictions.length > 0 
      ? (predictions.reduce((sum, p) => sum + parseFloat(p.probability || 0), 0) / predictions.length).toFixed(1)
      : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          Doctor's Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload CSV file for batch patient analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2" />
            Batch Upload
          </h2>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Upload a CSV file with patient data
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Choose File
          </button>
          {csvData && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">
              ✓ {csvData.length} records loaded
            </p>
          )}
        </div>

        {csvData && csvData.length > 0 && (
          <div className="mt-4">
            <button
              onClick={processBatchPredictions}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Process Batch Predictions'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{stats.lowRisk}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Risk %</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgProbability}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {predictions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Prediction Results
            </h2>
            <button
              onClick={exportToPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th 
                    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleSort('patientId')}
                  >
                    <div className="flex items-center">
                      Patient ID
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Age</th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Sex</th>
                  <th 
                    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleSort('prediction')}
                  >
                    <div className="flex items-center">
                      Prediction
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleSort('probability')}
                  >
                    <div className="flex items-center">
                      Risk % 
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Risk Level</th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((patient, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3 text-gray-900 dark:text-white font-medium">{patient.patientId}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{patient.age}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{patient.sex === 1 ? 'Male' : 'Female'}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        patient.prediction === 'High Risk' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {patient.prediction}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 font-semibold">{patient.probability}%</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{patient.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsDashboard;


