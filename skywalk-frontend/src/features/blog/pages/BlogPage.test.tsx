import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import BlogPage from './BlogPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m = key.match(/^blog\.articles\.([^.]+)\.(title|excerpt)$/);
      if (m) return `${m[1]}-${m[2]}`;
      return key;
    },
    i18n: { language: 'fr' },
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <BlogPage />
    </MemoryRouter>,
  );
}

describe('BlogPage', () => {
  it('renders the featured articles by default', () => {
    renderPage();
    expect(screen.getByText('blog.page.featured')).toBeInTheDocument();
    expect(screen.getAllByText('checklist-avant-depart-title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('budget-expatriation-title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('demarches-visa-title').length).toBeGreaterThan(0);
  });

  it('renders a card for every article in the "all" list', () => {
    renderPage();
    expect(screen.getByText('temoignage-japon-title')).toBeInTheDocument();
    expect(screen.getByText('apprendre-langue-title')).toBeInTheDocument();
  });

  it('filters by category and hides the featured section', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'blog.categories.testimonial' }));
    expect(screen.queryByText('blog.page.featured')).not.toBeInTheDocument();
    expect(screen.getByText('temoignage-japon-title')).toBeInTheDocument();
    expect(screen.queryAllByText('checklist-avant-depart-title')).toHaveLength(0);
  });

  it('returns to the "all" category and shows the featured section again', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'blog.categories.testimonial' }));
    fireEvent.click(screen.getByRole('button', { name: 'blog.page.allCategories' }));
    expect(screen.getByText('blog.page.featured')).toBeInTheDocument();
  });

  it('filters by search text across title and excerpt', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('blog.page.searchPlaceholder'), {
      target: { value: 'temoignage-japon' },
    });
    expect(screen.getByText('temoignage-japon-title')).toBeInTheDocument();
    expect(screen.queryByText('checklist-avant-depart-title')).not.toBeInTheDocument();
  });

  it('shows the empty state when no article matches', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('blog.page.searchPlaceholder'), {
      target: { value: 'zzz-no-match-zzz' },
    });
    expect(screen.getByText('blog.page.noResults')).toBeInTheDocument();
  });

  it('links each card to its article page', () => {
    renderPage();
    expect(screen.getAllByText('checklist-avant-depart-title')[0].closest('a')).toHaveAttribute(
      'href',
      '/blog/checklist-avant-depart',
    );
  });
});
