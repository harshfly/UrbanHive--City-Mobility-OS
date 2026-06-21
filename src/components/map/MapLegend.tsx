import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-bg-surface/95 backdrop-blur-sm border border-border-subtle rounded-xl px-4 py-3 shadow-md">
      <h4 className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary mb-2">Road Status</h4>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 rounded-full bg-accent-primary" />
          <span className="text-xs text-text-secondary">Flowing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 rounded-full bg-accent-amber" />
          <span className="text-xs text-text-secondary">Predicted risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 rounded-full bg-accent-red" />
          <span className="text-xs text-text-secondary">Critical</span>
        </div>
      </div>
    </div>
  );
};
