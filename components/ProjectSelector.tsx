
import React from 'react';
import { Project } from '../types';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  isKeySet: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onAnalyze,
  isLoading,
  isKeySet,
}) => {
  const isButtonDisabled = isLoading || !selectedProjectId || !isKeySet;
  const buttonTitle = !isKeySet ? "Please save your API keys in the Configuration section first." : "";

  return (
    <div className="bg-brand-surface p-4 rounded-lg border border-brand-border shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="flex-grow">
          <label htmlFor="project-select" className="block text-sm font-medium text-brand-muted mb-1">
            Select Project
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            disabled={isLoading || !isKeySet}
            className="w-full bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            {!isKeySet ? (
              <option>Please provide API keys...</option>
            ) : projects.length === 0 ? (
              <option>Loading projects...</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isButtonDisabled}
          title={buttonTitle}
          className="w-full sm:w-auto px-3 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-blue-500 disabled:bg-brand-muted disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Project'}
        </button>
      </div>
    </div>
  );
};

export default ProjectSelector;
