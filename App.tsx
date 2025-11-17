import React, { useState, useEffect, useCallback } from 'react';
import { Project, AnalysisResult } from './types';
import { getProjects, getProjectSnapshot } from './services/pmsService';
import { getProjectAnalysis } from './services/geminiService';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import ConfigurationPanel from './components/ConfigurationPanel';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pmsApiKey, setPmsApiKey] = useState<string>('');

  // FIX: Per Gemini API guidelines, Gemini API key is removed from UI. This handler now only saves the PMS API key.
  const handlePmsKeySave = (key: string) => {
    setPmsApiKey(key);
    // Clear previous results and errors when keys change
    setAnalysisResult(null);
    setError(null);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!pmsApiKey) {
        setProjects([]);
        return;
      }
      // Indicate loading while fetching projects
      setIsLoading(true);
      setError(null);
      try {
        const projectList = await getProjects(pmsApiKey);
        setProjects(projectList);
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        } else {
          setSelectedProjectId('');
        }
      } catch (e) {
        setError('Failed to fetch project list. Check your PMS API Key and connection.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [pmsApiKey]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedProjectId) {
      setError('Please select a project to analyze.');
      return;
    }
    // FIX: Per Gemini API guidelines, Gemini API key is removed from UI. Only check for PMS API key.
    if (!pmsApiKey) {
      setError('Please provide the PMS API key in the configuration section.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const snapshot = await getProjectSnapshot(selectedProjectId, pmsApiKey);
      // FIX: Per Gemini API guidelines, getProjectAnalysis sources the API key from environment variables.
      const result = await getProjectAnalysis(snapshot);
      setAnalysisResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, pmsApiKey]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-secondary">
      <header className="p-4 border-b border-brand-border bg-brand-surface">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white">
            NAPE - Nuance-Adjusted Predictive Engine
          </h1>
          <p className="text-brand-muted">
            Recursive Reasoning for Predictive Project Analytics
          </p>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* FIX: Per Gemini API guidelines, Gemini API key is removed from UI. Prop name updated. */}
          <ConfigurationPanel onPmsKeySave={handlePmsKeySave} />
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            // FIX: Per Gemini API guidelines, Gemini API key is removed from UI. Only check for PMS API key.
            areKeysSet={!!pmsApiKey}
          />
          {error && <ErrorDisplay message={error} />}
          {isLoading && <Loader />}
          {analysisResult && !isLoading && <Dashboard data={analysisResult} />}
          {!analysisResult && !isLoading && !error && (
             <div className="text-center py-20 px-6 bg-brand-surface border border-brand-border rounded-lg mt-6">
                <h2 className="text-xl font-semibold text-white">Welcome to NAPE</h2>
                <p className="mt-2 text-brand-muted">
                  {/* FIX: Per Gemini API guidelines, updated welcome text to only ask for PMS API key. */}
                  Please enter your PMS API key in the configuration section above, then select a project and click "Analyze Project" to generate predictive insights.
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;