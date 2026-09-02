import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BlogArticlePage from './BlogArticlePage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'blog.articles.checklist-avant-depart.content') {
        return 'Intro paragraph.\n\n## A section title\n\n### A subsection\n\n- item one\n- item two\n\nAnother paragraph.';
      }
      return key;
    },
    i18n: { language: 'fr' },
  }),
}));

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/blog/${id}`]}>
      <Routes>
        <Route path="/blog/:id" element={<BlogArticlePage />} />
        <Route path="/blog" element={<div>Blog list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BlogArticlePage', () => {
  it('redirects to /blog when the article id is unknown', () => {
    renderAt('does-not-exist');
    expect(screen.getByText('Blog list')).toBeInTheDocument();
  });

  it('renders the article title, category, and formatted content blocks', () => {
    renderAt('checklist-avant-depart');
    expect(screen.getByRole('heading', { level: 1, name: 'blog.articles.checklist-avant-depart.title' })).toBeInTheDocument();
    expect(screen.getByText('blog.categories.preparation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'A section title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'A subsection' })).toBeInTheDocument();
    expect(screen.getByText('item one')).toBeInTheDocument();
    expect(screen.getByText('item two')).toBeInTheDocument();
    expect(screen.getByText('Intro paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument();
  });

  it('renders related articles from the same category, excluding itself', () => {
    renderAt('checklist-avant-depart');
    expect(screen.getByText('blog.article.relatedArticles')).toBeInTheDocument();
    // same category (preparation): enfants-expatriation
    expect(screen.getByText('blog.articles.enfants-expatriation.title')).toBeInTheDocument();
  });

  it('does not render the related section when there are no related articles', () => {
    renderAt('demarches-visa');
    expect(screen.queryByText('blog.article.relatedArticles')).not.toBeInTheDocument();
  });
});
