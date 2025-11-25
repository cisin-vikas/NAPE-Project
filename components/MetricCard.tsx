
import React from 'react';

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, children }) => {
  return (
    <div className="bg-brand-surface p-4 rounded-lg border border-brand-border text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-brand-primary hover:shadow-lg">
      <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
};

export default MetricCard;