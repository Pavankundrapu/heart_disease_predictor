import React, { useState } from 'react';
import { CheckCircle, Activity, Salad, Cigarette, Sun, Heart } from 'lucide-react';

const LIFESTYLE_ITEMS = [
  { icon: <Activity className="w-5 h-5 text-blue-500" />, label: 'Physical Activity (30+ min)' },
  { icon: <Salad className="w-5 h-5 text-green-600" />, label: 'Healthy Diet' },
  { icon: <Sun className="w-5 h-5 text-yellow-500" />, label: 'Adequate Sleep' },
  { icon: <Cigarette className="w-5 h-5 text-red-500" />, label: 'No Smoking' },
];

const HIGH_RISK_TIPS = [
  'Follow all clinical advice strictly.',
  'Increase activity as advised by cardiologist.',
  'Limit sodium, saturated fats, sugary foods.',
  'Record blood pressure and cholesterol daily.',
  'Avoid smoking and alcohol.',
];

const LOW_RISK_TIPS = [
  'Maintain your healthy lifestyle!',
  'Continue regular check-ups.',
  'Stay physically active and eat balanced meals.',
  'Manage stress and get enough sleep.',
  'Avoid tobacco and limit alcohol.',
];

function LifestyleTracker({ riskLevel = 'Low', onUpdate }) {
  const [checked, setChecked] = useState(Array(LIFESTYLE_ITEMS.length).fill(false));
  const completed = checked.filter(Boolean).length;
  const progress = Math.round((completed / checked.length) * 100);

  const handleCheck = idx => {
    const updated = checked.map((v, i) => (i === idx ? !v : v));
    setChecked(updated);
    onUpdate && onUpdate(updated);
  };

  const tips = riskLevel === 'High' ? HIGH_RISK_TIPS : LOW_RISK_TIPS;
  const color = riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'yellow' : 'green';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-fadeIn" aria-label="Lifestyle Recommendation Tracker">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Heart className={`w-5 h-5 mr-2 text-${color}-500`} />
        Daily Lifestyle Tracker
      </h3>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <ul className="space-y-3 mb-4">
        {LIFESTYLE_ITEMS.map((item, idx) => (
          <li key={item.label} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checked[idx]}
              id={`life-${idx}`}
              onChange={() => handleCheck(idx)}
              className={`h-5 w-5 focus:ring-${color}-400 accent-${color}-500 transition-colors`}
              aria-label={item.label}
            />
            <label htmlFor={`life-${idx}`} className="flex items-center cursor-pointer select-none">
              {item.icon}
              <span className="ml-2 text-gray-700">{item.label}</span>
            </label>
            {checked[idx] && <CheckCircle className="w-5 h-5 text-green-500 ml-1" />}
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <h4 className="font-medium mb-1 text-gray-800">AI Lifestyle Tips:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ol>
      </div>
    </div>
  );
}

export default LifestyleTracker;



