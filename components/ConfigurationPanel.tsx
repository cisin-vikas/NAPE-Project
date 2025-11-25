import React, { useState, useEffect } from 'react';
import { KeyIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon } from './icons';

interface ConfigurationPanelProps {
  onKeysSave: (keys: { pmsKey: string; }) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onKeysSave }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [pmsKey, setPmsKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showPmsKey, setShowPmsKey] = useState(false);

  useEffect(() => {
    const savedPmsKey = localStorage.getItem('pmsApiKey');
    if (savedPmsKey) {
      setPmsKey(savedPmsKey);
      onKeysSave({ pmsKey: savedPmsKey });
      setIsOpen(false);
    }
  }, [onKeysSave]);

  const handleSave = () => {
    localStorage.setItem('pmsApiKey', pmsKey);
    onKeysSave({ pmsKey });
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
          <p className="text-sm text-brand-muted">Your PMS API key is saved in your browser's local storage for convenience. It is not sent anywhere else.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="pms-key" className="block text-sm font-medium text-brand-muted mb-1">
                PMS API Key
              </label>
              <div className="relative">
                <input
                  id="pms-key"
                  type={showPmsKey ? "text" : "password"}
                  value={pmsKey}
                  onChange={(e) => setPmsKey(e.target.value)}
                  placeholder="Enter your PMS API Key"
                  className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 pr-10 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPmsKey(!showPmsKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-secondary focus:outline-none"
                  aria-label={showPmsKey ? "Hide API Key" : "Show API Key"}
                >
                  {showPmsKey ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center">
            {isSaved && <span className="text-sm text-status-green mr-4 transition-opacity duration-300">Key saved!</span>}
            <button
              onClick={handleSave}
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