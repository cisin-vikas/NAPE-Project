
import React, { useState, useEffect, useCallback } from 'react';
import { Project, AnalysisResult, ProjectSnapshot } from './types';
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
  const [currentSnapshot, setCurrentSnapshot] = useState<ProjectSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pmsApiKey, setPmsApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  const handleKeysSave = useCallback((keys: { pmsKey: string; geminiKey: string }) => {
    setPmsApiKey(keys.pmsKey);
    setGeminiApiKey(keys.geminiKey);
    // Clear previous results and errors when keys change
    setAnalysisResult(null);
    setCurrentSnapshot(null);
    setError(null);
  }, []);


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
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while fetching projects.';
        setError(errorMessage);
        setProjects([]); // Clear stale projects
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
    if (!pmsApiKey || !geminiApiKey) {
      setError('Please provide both the PMS API Key and Gemini API Key in the configuration section.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentSnapshot(null);

    try {
      const snapshot = await getProjectSnapshot(selectedProjectId, pmsApiKey);
      setCurrentSnapshot(snapshot);
      const result = await getProjectAnalysis(snapshot, geminiApiKey);
      setAnalysisResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, pmsApiKey, geminiApiKey]);

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
          <ConfigurationPanel onKeysSave={handleKeysSave} />
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            isKeySet={!!pmsApiKey && !!geminiApiKey}
          />
          {error && <ErrorDisplay message={error} />}
          {isLoading && <Loader />}
          {analysisResult && !isLoading && (
            <Dashboard 
              data={analysisResult} 
              tasks={currentSnapshot?.tasks}
              team={currentSnapshot?.team}
            />
          )}
          {!analysisResult && !isLoading && !error && (
             <div className="text-center py-20 px-6 bg-brand-surface border border-brand-border rounded-lg mt-6">
                <h2 className="text-xl font-semibold text-white">Welcome to NAPE</h2>
                <p className="mt-2 text-brand-muted">
                  Please enter your PMS and Gemini API keys in the configuration section above, then select a project and click "Analyze Project" to generate predictive insights.
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
