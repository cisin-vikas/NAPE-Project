
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-status-red text-red-200 px-4 py-3 rounded-lg relative mt-6" role="alert">
      <div className="flex items-center">
        <ExclamationTriangleIcon className="h-6 w-6 text-status-red mr-3" />
        <div>
            <strong className="font-bold">Error</strong>
            <span className="block sm:inline ml-2">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
