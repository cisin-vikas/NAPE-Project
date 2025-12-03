
import React from 'react';
import { AnalysisResult, ProjectSnapshot } from '../types';
import MetricCard from './MetricCard';
import Gauge from './Gauge';
import RiskList from './RiskList';
import RecommendationList from './RecommendationList';
import Diagnostics from './Diagnostics';
import { BeakerIcon } from './icons';
import ExportButton from './ExportButton';
import BurndownChart from './BurndownChart';
import TaskList from './TaskList';

interface DashboardProps {
  data: AnalysisResult;
  tasks?: ProjectSnapshot['tasks'];
  team?: ProjectSnapshot['team'];
}

const Dashboard: React.FC<DashboardProps> = ({ data, tasks, team }) => {
  const getStatusColor = () => {
    switch (data.projectStatus) {
      case 'On Track': return 'text-status-green';
      case 'At Risk': return 'text-status-yellow';
      case 'Off Track': return 'text-status-red';
      default: return 'text-brand-muted';
    }
  };

  const getConfidenceColor = () => {
    switch (data.confidenceLevel) {
      case 'High': return 'text-status-green';
      case 'Medium': return 'text-status-yellow';
      case 'Low': return 'text-status-red';
      default: return 'text-brand-muted';
    }
  };

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.projectName}</h2>
            <p className="text-brand-muted">Analysis as of: {new Date(data.asOfDate).toLocaleDateString()}</p>
          </div>
          <ExportButton analysisData={data} team={team} />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Project Status">
            <p className={`text-2xl font-bold ${getStatusColor()}`}>{data.projectStatus}</p>
        </MetricCard>
        <MetricCard title="Projected Completion">
            <p className="text-2xl font-bold text-white">{new Date(data.projectedCompletionDate).toLocaleDateString()}</p>
        </MetricCard>
        <MetricCard title="Confidence Level">
            <p className={`text-2xl font-bold ${getConfidenceColor()}`}>{data.confidenceLevel}</p>
        </MetricCard>
        <MetricCard title="Days Remaining">
            <p className="text-2xl font-bold text-white">{data.estimatedDaysRemaining}</p>
        </MetricCard>
      </div>

      {/* Gauges and Justification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-6">
            <Gauge label="Raw Completion" percentage={data.rawCompletionPercent} />
            <Gauge label="Adjusted Completion" percentage={data.adjustedCompletionPercent} />
        </div>
        <div className="lg:col-span-2 bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <BeakerIcon className="h-5 w-5 mr-2" />
            Analysis Justification
          </h3>
          <p className="text-brand-muted leading-relaxed">{data.justification}</p>
        </div>
      </div>

      {/* Burndown Chart */}
      {data.burndownTrend && data.burndownTrend.length > 0 && (
         <div className="grid grid-cols-1">
             <BurndownChart data={data.burndownTrend} />
         </div>
      )}

      {/* Risks and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskList risks={data.topRisks} />
        <RecommendationList recommendations={data.recommendations} />
      </div>
      
      {/* Task List */}
      {tasks && <TaskList tasks={tasks} />}

      {/* Diagnostics */}
      <Diagnostics diagnostics={data.diagnostics} />

    </div>
  );
};

export default Dashboard;
