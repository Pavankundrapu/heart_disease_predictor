import React from 'react';

/**
 * RiskGauge component: Animated semi-circular gauge for risk visualization
 * Props:
 *   - score: number (0..1, required)
 *   - label: string (optional, e.g., 'Your Risk Score')
 *   - size: number (optional, px, default 160)
 */
const RiskGauge = ({ score = 0, label = '', size = 160 }) => {
  // Clamp and interpret risk
  const safeScore = Math.max(0, Math.min(1, parseFloat(score) || 0));
  const pct = safeScore * 100;
  let riskLevel = 'Low', color = '#22c55e';
  if (pct >= 70) { riskLevel = 'High'; color = '#ef4444'; }
  else if (pct >= 40) { riskLevel = 'Medium'; color = '#f59e42'; color = '#facc15'; } // Yellow

  // SVG Gauge dimensions
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius;
  const arc = circumference * safeScore;

  // For animation: offset so arc grows with score
  const arcOffset = circumference - arc;

  return (
    <div className="flex flex-col items-center justify-center animate-fadeIn" aria-label="Risk Gauge Visualization">
      {label && <div className="mb-2 text-gray-700 font-semibold text-sm">{label}</div>}
      <svg width={size} height={size/1.9} viewBox={`0 0 ${size} ${size/1.9}`}>
        {/* Track */}
        <path
          d={`M ${stroke/2},${size/2 - stroke/2} A ${radius} ${radius} 0 0 1 ${size-stroke/2},${size/2 - stroke/2}`}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${stroke/2},${size/2 - stroke/2} A ${radius} ${radius} 0 0 1 ${size-stroke/2},${size/2 - stroke/2}`}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={arcOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.86,0,.07,1)', filter: 'drop-shadow(0 2px 6px #0002)' }}
        />
        {/* Risk % label in center */}
        <text x="50%" y={size/2.7} textAnchor="middle" fontSize={size/7.5} fontWeight="bold" fill={color}>
          {Math.round(pct)}%
        </text>
        {/* Risk level */}
        <text x="50%" y={size/1.85} textAnchor="middle" fontSize={size/9} fill="#555" fontWeight={500}>
          {riskLevel}
        </text>
      </svg>
    </div>
  );
};

export default RiskGauge;



