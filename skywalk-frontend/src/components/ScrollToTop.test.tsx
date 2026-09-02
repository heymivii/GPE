import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('scrolls to the top on mount', () => {
    render(
      <MemoryRouter initialEntries={['/a']}>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to the top again when the route changes', () => {
    render(
      <MemoryRouter initialEntries={['/a']}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b">go</Link>} />
          <Route path="/b" element={<div>page b</div>} />
        </Routes>
      </MemoryRouter>,
    );
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(document.querySelector('a')!);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders nothing', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
