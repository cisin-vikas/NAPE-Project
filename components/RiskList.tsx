
import React from 'react';
import { ExclamationTriangleIcon } from './icons';
import { AnalysisResult } from '../types';

interface RiskListProps {
  risks: AnalysisResult['topRisks'];
}

const RiskList: React.FC<RiskListProps> = ({ risks }) => {
  return (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-status-red" />
        Top Risks
      </h3>
      <ul className="space-y-4">
        {risks.length > 0 ? risks.map((item, index) => (
          <li key={index} className="border-l-4 border-status-red pl-4">
            <p className="font-semibold text-brand-secondary">{item.risk}</p>
            <p className="text-sm text-brand-muted">{item.details}</p>
          </li>
        )) : (
            <li className="text-brand-muted">No significant risks identified.</li>
        )}
      </ul>
    </div>
  );
};

export default RiskList;
