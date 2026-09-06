import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface AuthPromptCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  benefits?: string[];
}

export default function AuthPromptCard({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaLink,
  benefits = []
}: AuthPromptCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-brand-ink rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>

      {benefits.length > 0 && (
        <ul className="space-y-2 mb-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={ctaLink}
        className="block w-full text-center px-6 py-3 bg-brand-ink text-white font-semibold rounded-full hover:bg-brand-ink-hover transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  );
}
