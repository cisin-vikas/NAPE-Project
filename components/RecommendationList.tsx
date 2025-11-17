
import React from 'react';
import { LightBulbIcon } from './icons';
import { AnalysisResult } from '../types';

interface RecommendationListProps {
  recommendations: AnalysisResult['recommendations'];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <LightBulbIcon className="h-5 w-5 mr-2 text-status-yellow" />
        Recommendations
      </h3>
      <ul className="space-y-4">
        {recommendations.length > 0 ? recommendations.map((item, index) => (
          <li key={index} className="border-l-4 border-brand-primary pl-4">
            <p className="font-semibold text-brand-secondary">{item.action}</p>
            <p className="text-sm text-brand-muted">{item.details}</p>
          </li>
        )) : (
            <li className="text-brand-muted">No specific recommendations at this time.</li>
        )}
      </ul>
    </div>
  );
};

export default RecommendationList;
