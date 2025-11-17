import React, { useState } from 'react';
import { KeyIcon, ChevronDownIcon } from './icons';

interface ConfigurationPanelProps {
  // FIX: Per Gemini API guidelines, Gemini API key is removed from UI. Prop updated to only handle PMS key.
  onPmsKeySave: (key: string) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onPmsKeySave }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [pmsKey, setPmsKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // FIX: Per Gemini API guidelines, Gemini API key is removed from UI. Handler now only saves PMS key.
    onPmsKeySave(pmsKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2s
  };

  return (
    <div className="bg-brand-surface rounded-lg border border-brand-border mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="config-panel"
      >
        <h2 className="text-lg font-semibold text-white flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            Configuration
        </h2>
        <ChevronDownIcon className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div id="config-panel" className="p-4 border-t border-brand-border space-y-4 animate-fade-in">
          <p className="text-sm text-brand-muted">API keys are stored in memory for this session only and are not saved anywhere else.</p>
          {/* FIX: Per Gemini API guidelines, Gemini API key input is removed. */}
          <div>
            <label htmlFor="pms-key" className="block text-sm font-medium text-brand-muted mb-1">
              PMS API Key
            </label>
            <input
              id="pms-key"
              type="password"
              value={pmsKey}
              onChange={(e) => setPmsKey(e.target.value)}
              placeholder="Enter your PMS API Key"
              className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="flex justify-end items-center">
            {isSaved && <span className="text-sm text-status-green mr-4 transition-opacity duration-300">Key saved for session!</span>}
            <button
              onClick={handleSave}
              // FIX: Per Gemini API guidelines, button is enabled when only PMS key is present.
              disabled={!pmsKey}
              className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-blue-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
            >
              Save Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;