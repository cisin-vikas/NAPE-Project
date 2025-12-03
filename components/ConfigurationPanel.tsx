
import React, { useState, useEffect } from 'react';
import { KeyIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon } from './icons';

interface ConfigurationPanelProps {
  onKeysSave: (keys: { pmsKey: string; geminiKey: string }) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onKeysSave }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [pmsKey, setPmsKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showPmsKey, setShowPmsKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    const savedPmsKey = localStorage.getItem('pmsApiKey');
    const savedGeminiKey = localStorage.getItem('geminiApiKey');
    
    if (savedPmsKey || savedGeminiKey) {
      if (savedPmsKey) setPmsKey(savedPmsKey);
      if (savedGeminiKey) setGeminiKey(savedGeminiKey);
      
      onKeysSave({ 
        pmsKey: savedPmsKey || '', 
        geminiKey: savedGeminiKey || '' 
      });

      // Close panel if both keys are present
      if (savedPmsKey && savedGeminiKey) {
        setIsOpen(false);
      }
    }
  }, [onKeysSave]);

  const handleSave = () => {
    localStorage.setItem('pmsApiKey', pmsKey);
    localStorage.setItem('geminiApiKey', geminiKey);
    onKeysSave({ pmsKey, geminiKey });
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
          <p className="text-sm text-brand-muted">Your API keys are saved in your browser's local storage for convenience. They are not sent anywhere other than their respective services.</p>
          <div className="space-y-4">
            {/* PMS API Key */}
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
                  aria-label={showPmsKey ? "Hide PMS API Key" : "Show PMS API Key"}
                >
                  {showPmsKey ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div>
              <label htmlFor="gemini-key" className="block text-sm font-medium text-brand-muted mb-1">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  id="gemini-key"
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 pr-10 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-secondary focus:outline-none"
                  aria-label={showGeminiKey ? "Hide Gemini API Key" : "Show Gemini API Key"}
                >
                  {showGeminiKey ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center">
            {isSaved && <span className="text-sm text-status-green mr-4 transition-opacity duration-300">Keys saved!</span>}
            <button
              onClick={handleSave}
              disabled={!pmsKey || !geminiKey}
              className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-blue-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
            >
              Save Keys
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
