import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex overflow-x-auto scrollbar-hide w-full ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 whitespace-nowrap px-1 py-2">
        <li className="inline-flex items-center shrink-0">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center shrink-0 text-sm">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
            {item.path ? (
              <Link
                to={item.path}
                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-500">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
