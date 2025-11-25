
import React from 'react';
import { PresentationChartLineIcon } from './icons';

interface VelocityChartProps {
  data: { sprint: string; points: number }[];
}

const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate dimensions and scales
  const width = 600;
  const height = 200;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxPoints = Math.max(...data.map(d => d.points)) * 1.2 || 10;
  
  // Helper to map data to SVG coordinates
  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };
  const getY = (points: number) => height - padding.bottom - (points / maxPoints) * graphHeight;

  const pointsString = data
    .map((d, i) => `${getX(i)},${getY(d.points)}`)
    .join(' ');

  return (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <PresentationChartLineIcon className="h-5 w-5 mr-2 text-brand-primary" />
        Velocity Trend (Last {data.length} Sprints)
      </h3>
      <div className="w-full h-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
             const yVal = height - padding.bottom - tick * graphHeight;
             const labelVal = Math.round(tick * maxPoints);
             return (
               <g key={tick}>
                  <line 
                    x1={padding.left} 
                    y1={yVal} 
                    x2={width - padding.right} 
                    y2={yVal} 
                    stroke="#30363D" 
                    strokeDasharray="4"
                  />
                  <text 
                    x={padding.left - 10} 
                    y={yVal + 4} 
                    fill="#8B949E" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {labelVal}
                  </text>
               </g>
             );
          })}

          {/* Trend Line */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#58A6FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Area under curve (optional opacity) */}
          <polygon
            points={`${padding.left},${height - padding.bottom} ${pointsString} ${width - padding.right},${height - padding.bottom}`}
            fill="#58A6FF"
            fillOpacity="0.1"
          />

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.points)}
                r="4"
                fill="#0D1117"
                stroke="#58A6FF"
                strokeWidth="2"
              />
              <text
                x={getX(i)}
                y={getY(d.points) - 10}
                fill="#C9D1D9"
                fontSize="10"
                textAnchor="middle"
              >
                {d.points}
              </text>
              <text
                x={getX(i)}
                y={height - padding.bottom + 20}
                fill="#8B949E"
                fontSize="10"
                textAnchor="middle"
              >
                {d.sprint}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default VelocityChart;
