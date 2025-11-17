
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-brand-surface border border-brand-border rounded-lg mt-6">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
      <h2 className="text-xl font-semibold text-white">Analyzing Project Data...</h2>
      <p className="mt-2 text-brand-muted">
        NAPE is running recursive reasoning passes. This may take a moment.
      </p>
    </div>
  );
};

export default Loader;
