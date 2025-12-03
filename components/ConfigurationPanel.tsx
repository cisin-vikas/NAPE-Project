
import React, { useState, useEffect } from 'react';
import { KeyIcon, ChevronDownIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from './icons';

interface ConfigurationPanelProps {
  onKeysSave: (keys: { pmsKey: string; geminiKey: string }) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onKeysSave }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [pmsKey, setPmsKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  // New state: 'isEditing' determines if we show inputs or the "Configured" summary
  const [isEditing, setIsEditing] = useState(true);
  
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

      // If both keys are already saved, switch to View mode and close the panel
      if (savedPmsKey && savedGeminiKey) {
        setIsEditing(false);
        setIsOpen(false);
      }
    }
  }, [onKeysSave]);

  const handleSave = () => {
    localStorage.setItem('pmsApiKey', pmsKey);
    localStorage.setItem('geminiApiKey', geminiKey);
    onKeysSave({ pmsKey, geminiKey });
    setIsEditing(false); // Switch back to View mode
    setIsOpen(false);  // Auto-collapse on save for a cleaner UI
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsOpen(true); // Ensure panel is open when editing
  };

  return (
    <div className="bg-brand-surface rounded-lg border border-brand-border mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
        aria-expanded={isOpen}
        aria-controls="config-panel"
      >
        <div className="flex items-center">
            <KeyIcon className="h-5 w-5 mr-2 text-white" />
            <h2 className="text-lg font-semibold text-white mr-3">Configuration</h2>
            {!isEditing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-status-green border border-green-800">
                    Configured
                </span>
            )}
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-brand-muted transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div id="config-panel" className="p-4 border-t border-brand-border animate-fade-in">
          {!isEditing ? (
            // VIEW MODE
            <div className="flex items-center justify-between bg-brand-bg p-4 rounded-md border border-brand-border">
                <div className="flex items-center space-x-3">
                   <CheckCircleIcon className="h-8 w-8 text-status-green" />
                   <div>
                      <p className="text-white font-medium">API Keys Configured</p>
                      <p className="text-sm text-brand-muted">Your keys are securely stored in your browser.</p>
                   </div>
                </div>
                <button 
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm bg-brand-surface border border-brand-border text-brand-secondary hover:bg-brand-border hover:text-white rounded-md transition-colors"
                >
                  Change Keys
                </button>
             </div>
          ) : (
            // EDIT MODE
            <>
              <p className="text-sm text-brand-muted mb-4">
                Your API keys are saved in your browser's local storage for convenience. They are not sent anywhere other than their respective services.
              </p>
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
                      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 pr-10 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
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
                      className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 pr-10 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
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
              <div className="flex justify-end items-center mt-6">
                <button
                  onClick={handleSave}
                  disabled={!pmsKey || !geminiKey}
                  className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-blue-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
                >
                  Save Keys
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
