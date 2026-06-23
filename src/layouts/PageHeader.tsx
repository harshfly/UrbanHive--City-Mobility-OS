import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-0">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden md:flex items-center gap-1 mb-1">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {b.to ? (
                  <Link to={b.to} className="text-xs text-text-tertiary hover:text-accent-primary transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-xs text-text-secondary">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-text-tertiary" />}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-display font-bold text-text-primary">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">{actions}</div>}
    </div>
  );
};
