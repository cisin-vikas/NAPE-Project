
import React from 'react';
import { ProjectSnapshot } from '../types';
import { LinkIcon } from './icons';

interface TaskListProps {
  tasks: ProjectSnapshot['tasks'];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-brand-surface p-6 rounded-lg border border-brand-border mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Task Overview</h3>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b border-brand-border text-brand-muted uppercase bg-brand-bg sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium text-center">Deps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {tasks.map(task => (
              <tr key={task.task_id} className="hover:bg-brand-bg/50 transition-colors">
                <td className="px-4 py-2 text-white font-medium">{task.task_id}</td>
                <td className="px-4 py-2">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                     ${task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'closed' 
                       ? 'bg-green-900/30 text-status-green' 
                       : 'bg-blue-900/30 text-brand-primary'}`}>
                     {task.status}
                   </span>
                </td>
                <td className="px-4 py-2 text-brand-secondary">{task.priority}</td>
                <td className="px-4 py-2 text-brand-muted">{task.assignee_id}</td>
                <td className="px-4 py-2 text-center">
                  {task.dependencies && task.dependencies.length > 0 ? (
                    <div 
                      className="group relative inline-flex items-center justify-center space-x-1 cursor-help"
                      title={`Depends on: ${task.dependencies.join(', ')}`}
                    >
                        <LinkIcon className="h-4 w-4 text-brand-primary" />
                        <span className="text-xs text-brand-muted bg-brand-bg px-1.5 py-0.5 rounded-full border border-brand-border">
                           {task.dependencies.length}
                        </span>
                    </div>
                  ) : (
                    <span className="text-brand-muted opacity-30">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
