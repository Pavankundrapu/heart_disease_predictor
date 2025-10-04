import React from 'react';
import { Heart, Brain } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Inner heart icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600 animate-pulse`} />
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-gray-600 text-center font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
