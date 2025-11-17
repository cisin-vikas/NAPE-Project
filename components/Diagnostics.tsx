
import React, { useState } from 'react';
import { CodeBracketIcon, ChevronDownIcon } from './icons';
import { AnalysisResult } from '../types';

interface DiagnosticsProps {
  diagnostics: AnalysisResult['diagnostics'];
}

const Diagnostics: React.FC<DiagnosticsProps> = ({ diagnostics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasContent = diagnostics.missing.length > 0 || diagnostics.assumptions.length > 0 || diagnostics.suggestedData.length > 0;

  if (!hasContent) {
    return null;
  }
  
  return (
    <div className="bg-brand-surface rounded-lg border border-brand-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-lg font-semibold text-white flex items-center">
            <CodeBracketIcon className="h-5 w-5 mr-2" />
            Diagnostics
        </h3>
        <ChevronDownIcon className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-brand-border space-y-4 animate-fade-in">
          <div>
            <h4 className="font-semibold text-brand-secondary">Missing Data Fields:</h4>
            {diagnostics.missing.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-brand-muted mt-1">
                    {diagnostics.missing.map((item, i) => <li key={i}><code>{item}</code></li>)}
                </ul>
            ) : <p className="text-sm text-brand-muted mt-1">None</p>}
          </div>
          <div>
            <h4 className="font-semibold text-brand-secondary">Assumptions Made:</h4>
            {diagnostics.assumptions.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-brand-muted mt-1">
                    {diagnostics.assumptions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            ) : <p className="text-sm text-brand-muted mt-1">None</p>}
          </div>
          <div>
            <h4 className="font-semibold text-brand-secondary">Suggested Data to Collect:</h4>
            {diagnostics.suggestedData.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-brand-muted mt-1">
                    {diagnostics.suggestedData.map((item, i) => <li key={i}><code>{item}</code></li>)}
                </ul>
             ) : <p className="text-sm text-brand-muted mt-1">None</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;
