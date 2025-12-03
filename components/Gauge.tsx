
import React, { useEffect, useState } from 'react';

interface GaugeProps {
  label: string;
  percentage: number;
}

const Gauge: React.FC<GaugeProps> = ({ label, percentage }) => {
  const targetPercent = Math.round(percentage * 100);
  const [displayedPercent, setDisplayedPercent] = useState(0);
  const [strokePercent, setStrokePercent] = useState(0);

  useEffect(() => {
    // 1. Animate the text number (Count-up)
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: EaseOutExpo for a quick start and smooth settling
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentVal = Math.floor(easeProgress * targetPercent);
      setDisplayedPercent(currentVal);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayedPercent(targetPercent); // Ensure it lands exactly on target
      }
    };
    
    const animationId = window.requestAnimationFrame(step);

    // 2. Trigger the stroke animation
    // Use a small timeout to allow the initial "0" state to render so the CSS transition occurs.
    const timer = setTimeout(() => {
        setStrokePercent(targetPercent);
    }, 100);

    return () => {
        window.cancelAnimationFrame(animationId);
        clearTimeout(timer);
    };
  }, [targetPercent]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (strokePercent / 100) * circumference;

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
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{displayedPercent}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-brand-muted">{label}</p>
    </div>
  );
};

export default Gauge;
