import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Target, AlertCircle } from 'lucide-react';

const PatientDataComparison = ({ patientData, datasetStats }) => {
  const [comparisons, setComparisons] = useState([]);

  useEffect(() => {
    if (!patientData || !datasetStats || !datasetStats.statistics) return;

    const numericFeatures = {
      age: { label: 'Age', unit: 'years', higherRisk: 'higher' },
      trestbps: { label: 'Blood Pressure', unit: 'mmHg', higherRisk: 'higher' },
      chol: { label: 'Cholesterol', unit: 'mg/dl', higherRisk: 'higher' },
      thalach: { label: 'Max Heart Rate', unit: 'bpm', higherRisk: 'lower' },
      oldpeak: { label: 'ST Depression', unit: '', higherRisk: 'higher' },
    };

    const comps = [];
    
    for (const [feature, config] of Object.entries(numericFeatures)) {
      const patientValue = parseFloat(patientData[feature]);
      const stats = datasetStats.statistics[feature];
      
      if (stats && !isNaN(patientValue)) {
        const { mean, min, max, std, q25, q75 } = stats;
        const range = max - min;
        const patientPercent = ((patientValue - min) / range) * 100;
        const meanPercent = ((mean - min) / range) * 100;
        const q25Percent = ((q25 - min) / range) * 100;
        const q75Percent = ((q75 - min) / range) * 100;

        // Determine if patient is in risk range
        let riskLevel = 'normal';
        let deviation = 0;
        
        if (patientValue < q25) {
          riskLevel = config.higherRisk === 'lower' ? 'higher' : 'lower';
          deviation = ((patientValue - mean) / std) * -1;
        } else if (patientValue > q75) {
          riskLevel = config.higherRisk === 'higher' ? 'higher' : 'lower';
          deviation = (patientValue - mean) / std;
        }

        comps.push({
          feature,
          label: config.label,
          unit: config.unit,
          patientValue,
          mean,
          min,
          max,
          q25,
          q75,
          std,
          patientPercent,
          meanPercent,
          q25Percent,
          q75Percent,
          range,
          riskLevel,
          deviation: Math.abs(deviation)
        });
      }
    }

    setComparisons(comps);
  }, [patientData, datasetStats]);

  const getRiskColor = (riskLevel, feature) => {
    if (riskLevel === 'higher') {
      // For most features, higher = riskier, except heart rate (lower = riskier)
      if (feature === 'thalach') return 'text-blue-600 bg-blue-50';
      return 'text-red-600 bg-red-50';
    } else if (riskLevel === 'lower') {
      if (feature === 'thalach') return 'text-red-600 bg-red-50';
      return 'text-green-600 bg-green-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getIcon = (riskLevel, feature) => {
    if (riskLevel === 'higher') {
      if (feature === 'thalach') return <TrendingDown className="w-4 h-4" />;
      return <TrendingUp className="w-4 h-4" />;
    } else if (riskLevel === 'lower') {
      if (feature === 'thalach') return <TrendingUp className="w-4 h-4" />;
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  if (comparisons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Loading comparison data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
          Patient Data vs Dataset Statistics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compare your values with {datasetStats?.total_samples || '303'} patients from the UCI dataset
        </p>
      </div>

      <div className="space-y-6">
        {comparisons.map((comp) => (
          <div key={comp.feature} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {comp.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getRiskColor(comp.riskLevel, comp.feature)}`}>
                  {getIcon(comp.riskLevel, comp.feature)}
                  <span className="ml-1">
                    {comp.riskLevel === 'higher' ? 'Above Normal' : comp.riskLevel === 'lower' ? 'Below Normal' : 'Normal'}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {comp.patientValue.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}
                  {comp.unit && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{comp.unit}</span>}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Mean: {comp.mean.toFixed(comp.feature === 'oldpeak' ? 1 : 0)} {comp.unit}
                </div>
              </div>
            </div>

            {/* Visual Bar Comparison */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
                {/* Q25-Q75 Range (Normal Range) */}
                <div
                  className="absolute h-full bg-green-300 dark:bg-green-700 opacity-50"
                  style={{
                    left: `${comp.q25Percent}%`,
                    width: `${comp.q75Percent - comp.q25Percent}%`
                  }}
                  title={`Normal Range: ${comp.q25.toFixed(1)} - ${comp.q75.toFixed(1)}`}
                ></div>
                
                {/* Mean Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400"
                  style={{ left: `${comp.meanPercent}%` }}
                  title={`Mean: ${comp.mean.toFixed(1)}`}
                ></div>
                
                {/* Patient Value Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-purple-600 dark:bg-purple-400 transform -translate-x-1/2"
                  style={{ left: `${comp.patientPercent}%` }}
                  title={`Patient: ${comp.patientValue.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}`}
                ></div>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{comp.min.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</span>
                <div className="flex space-x-4">
                  <span>Q1: {comp.q25.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</span>
                  <span>Mean: {comp.mean.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</span>
                  <span>Q3: {comp.q75.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</span>
                </div>
                <span>{comp.max.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</span>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="text-blue-600 dark:text-blue-400 font-semibold">Min</div>
                <div className="text-gray-700 dark:text-gray-300">{comp.min.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="text-green-600 dark:text-green-400 font-semibold">Mean</div>
                <div className="text-gray-700 dark:text-gray-300">{comp.mean.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <div className="text-yellow-600 dark:text-yellow-400 font-semibold">Max</div>
                <div className="text-gray-700 dark:text-gray-300">{comp.max.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                <div className="text-purple-600 dark:text-purple-400 font-semibold">Std Dev</div>
                <div className="text-gray-700 dark:text-gray-300">{comp.std.toFixed(comp.feature === 'oldpeak' ? 1 : 0)}</div>
              </div>
            </div>

            {/* Deviation from Mean */}
            {comp.deviation > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {comp.deviation > 1 ? (
                  <span>
                    {comp.deviation.toFixed(1)} standard deviations from the mean
                  </span>
                ) : (
                  <span>
                    Close to average ({comp.deviation.toFixed(1)} SD from mean)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDataComparison;
