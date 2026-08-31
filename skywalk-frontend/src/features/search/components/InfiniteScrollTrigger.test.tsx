import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfiniteScrollTrigger from './InfiniteScrollTrigger';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;
let unobserveSpy: ReturnType<typeof vi.fn>;
let capturedCallback: IntersectionObserverCallback | null;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    capturedCallback = callback;
  }
  observe = observeSpy;
  unobserve = unobserveSpy;
  disconnect = disconnectSpy;
}

beforeEach(() => {
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  unobserveSpy = vi.fn();
  capturedCallback = null;
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;
});

afterEach(() => {
  delete (globalThis as any).IntersectionObserver;
});

describe('InfiniteScrollTrigger', () => {
  it('renders nothing when there is no more data to load', () => {
    const { container } = render(
      <InfiniteScrollTrigger onLoadMore={vi.fn()} hasMore={false} isLoading={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows the loading indicator while isLoading is true', () => {
    render(<InfiniteScrollTrigger onLoadMore={vi.fn()} hasMore={true} isLoading={true} />);
    expect(screen.getByText('searchPage.loadingResults')).toBeInTheDocument();
  });

  it('shows the scroll hint when not loading', () => {
    render(<InfiniteScrollTrigger onLoadMore={vi.fn()} hasMore={true} isLoading={false} />);
    expect(screen.getByText('searchPage.scrollForMore')).toBeInTheDocument();
  });

  it('observes the trigger element when hasMore is true and not loading', () => {
    render(<InfiniteScrollTrigger onLoadMore={vi.fn()} hasMore={true} isLoading={false} />);
    expect(observeSpy).toHaveBeenCalled();
  });

  it('calls onLoadMore when the trigger intersects', () => {
    const onLoadMore = vi.fn();
    render(<InfiniteScrollTrigger onLoadMore={onLoadMore} hasMore={true} isLoading={false} />);
    capturedCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('does not call onLoadMore when the entry is not intersecting', () => {
    const onLoadMore = vi.fn();
    render(<InfiniteScrollTrigger onLoadMore={onLoadMore} hasMore={true} isLoading={false} />);
    capturedCallback?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(
      <InfiniteScrollTrigger onLoadMore={vi.fn()} hasMore={true} isLoading={false} />,
    );
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
