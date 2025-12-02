import React from 'react';

interface PageSearchProps {
  children: React.ReactNode;
}

export function PageSearch({ children }: PageSearchProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </div>
    </div>
  );
}
