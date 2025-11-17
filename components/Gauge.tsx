
import React from 'react';

interface GaugeProps {
  label: string;
  percentage: number;
}

const Gauge: React.FC<GaugeProps> = ({ label, percentage }) => {
  const percent = Math.round(percentage * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-brand-surface p-4 rounded-lg border border-brand-border flex-1 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-brand-border"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="text-brand-primary"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{percent}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-brand-muted">{label}</p>
    </div>
  );
};

export default Gauge;
