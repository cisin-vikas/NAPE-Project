
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-status-red text-red-200 px-4 py-3 rounded-lg relative mt-6 overflow-hidden" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-status-red mr-3 mt-0.5" />
        </div>
        <div className="w-full">
            <strong className="font-bold block mb-1">Error</strong>
            <span className="block text-sm sm:text-base break-words whitespace-pre-wrap">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
