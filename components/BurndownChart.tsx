
import React from 'react';
import { PresentationChartLineIcon } from './icons';

interface BurndownChartProps {
  data: { sprint: string; idealRemaining: number; actualRemaining: number }[];
}

const BurndownChart: React.FC<BurndownChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate dimensions and scales
  const width = 600;
  const height = 250;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max value is the max of ideal or actual remaining points
  const maxPoints = Math.max(
    ...data.map(d => Math.max(d.idealRemaining, d.actualRemaining))
  ) * 1.1 || 10;
  
  // Helper to map data to SVG coordinates
  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };
  const getY = (points: number) => height - padding.bottom - (points / maxPoints) * graphHeight;

  // Generate points string for polylines
  const idealPointsString = data
    .map((d, i) => `${getX(i)},${getY(d.idealRemaining)}`)
    .join(' ');
    
  const actualPointsString = data
    .map((d, i) => `${getX(i)},${getY(d.actualRemaining)}`)
    .join(' ');

  return (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <PresentationChartLineIcon className="h-5 w-5 mr-2 text-brand-primary" />
        Project Burndown (Story Points)
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

          {/* Ideal Line (Dashed) */}
          <polyline
            points={idealPointsString}
            fill="none"
            stroke="#8B949E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,5"
          />

          {/* Actual Line (Solid) */}
          <polyline
            points={actualPointsString}
            fill="none"
            stroke="#58A6FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Area under Actual curve (optional opacity) */}
          <polygon
            points={`${padding.left},${height - padding.bottom} ${actualPointsString} ${width - padding.right},${height - padding.bottom}`}
            fill="#58A6FF"
            fillOpacity="0.1"
          />

          {/* Data Points (Actual) */}
          {data.map((d, i) => (
            <g key={i} className="group">
              <circle
                cx={getX(i)}
                cy={getY(d.actualRemaining)}
                r="4"
                fill="#0D1117"
                stroke="#58A6FF"
                strokeWidth="2"
              />
              <title>{`Sprint: ${d.sprint}\nActual: ${d.actualRemaining}\nIdeal: ${d.idealRemaining}`}</title>
            </g>
          ))}

          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - padding.bottom + 20}
              fill="#8B949E"
              fontSize="10"
              textAnchor="middle"
            >
              {d.sprint}
            </text>
          ))}

          {/* Legend */}
          <g transform={`translate(${width - 150}, ${padding.top})`}>
              <line x1="0" y1="0" x2="20" y2="0" stroke="#8B949E" strokeWidth="2" strokeDasharray="5,5" />
              <text x="25" y="4" fill="#8B949E" fontSize="12">Ideal</text>
              
              <line x1="0" y1="20" x2="20" y2="20" stroke="#58A6FF" strokeWidth="3" />
              <text x="25" y="24" fill="#C9D1D9" fontSize="12">Actual</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default BurndownChart;
