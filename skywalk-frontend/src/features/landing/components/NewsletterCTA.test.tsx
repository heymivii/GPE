import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsletterCTA from './NewsletterCTA';
import apiClient from '../../../lib/api';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../lib/api', () => ({
  default: { post: vi.fn() },
}));

describe('NewsletterCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not submit an empty email', () => {
    render(<NewsletterCTA />);
    fireEvent.submit(screen.getByPlaceholderText('landing.newsletter.placeholder').closest('form')!);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('subscribes successfully and shows the success message', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({} as any);
    render(<NewsletterCTA />);
    fireEvent.change(screen.getByPlaceholderText('landing.newsletter.placeholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.submit(screen.getByPlaceholderText('landing.newsletter.placeholder').closest('form')!);
    expect(apiClient.post).toHaveBeenCalledWith('/newsletter/subscribe', {
      email: 'jane@example.com',
      source: 'landing_page',
    });
    await vi.waitFor(() => expect(screen.getByText('landing.newsletter.successTitle')).toBeInTheDocument());
  });

  it('shows a server error message on failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({ response: { data: { message: 'Adresse invalide' } } });
    render(<NewsletterCTA />);
    fireEvent.change(screen.getByPlaceholderText('landing.newsletter.placeholder'), {
      target: { value: 'bad' },
    });
    fireEvent.submit(screen.getByPlaceholderText('landing.newsletter.placeholder').closest('form')!);
    await vi.waitFor(() => expect(screen.getByText('Adresse invalide')).toBeInTheDocument());
  });

  it('falls back to a generic error message', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({});
    render(<NewsletterCTA />);
    fireEvent.change(screen.getByPlaceholderText('landing.newsletter.placeholder'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.submit(screen.getByPlaceholderText('landing.newsletter.placeholder').closest('form')!);
    await vi.waitFor(() => expect(screen.getByText('landing.newsletter.error')).toBeInTheDocument());
  });
});
