
import React, { useState, useEffect, useCallback } from 'react';
import { Project, AnalysisResult } from './types';
import { getProjects, getProjectSnapshot } from './services/pmsService';
import { getProjectAnalysis } from './services/geminiService';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectList = await getProjects();
        setProjects(projectList);
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      } catch (e) {
        setError('Failed to fetch project list. Please try again later.');
        console.error(e);
      }
    };

    fetchProjects();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedProjectId) {
      setError('Please select a project to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const snapshot = await getProjectSnapshot(selectedProjectId);
      const result = await getProjectAnalysis(snapshot);
      setAnalysisResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

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
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          {error && <ErrorDisplay message={error} />}
          {isLoading && <Loader />}
          {analysisResult && !isLoading && <Dashboard data={analysisResult} />}
          {!analysisResult && !isLoading && !error && (
             <div className="text-center py-20 px-6 bg-brand-surface border border-brand-border rounded-lg mt-6">
                <h2 className="text-xl font-semibold text-white">Welcome to NAPE</h2>
                <p className="mt-2 text-brand-muted">Select a project and click "Analyze Project" to generate predictive insights.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
