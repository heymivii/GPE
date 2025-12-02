import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl">
          {children}
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight font-outfit">
            {title}
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
