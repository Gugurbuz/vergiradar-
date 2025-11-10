import React from 'react';

interface ProgressBarProps {
  progress: number;
  label: string;
  description: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, description }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700 dark:text-white">{description}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-white">{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
