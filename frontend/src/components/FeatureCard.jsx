import React from 'react';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color = "from-blue-500 to-blue-600",
  delay = 0 
}) => {
  return (
    <div 
      className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default FeatureCard;
