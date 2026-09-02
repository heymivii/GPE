import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: any) =>
      typeof opts?.defaultValue === 'string'
        ? opts.defaultValue.replace('{{value}}', opts.value).replace('{{count}}', opts.count)
        : _key,
  }),
}));

describe('StarRating (readOnly)', () => {
  it('renders a static label with the rounded value', () => {
    render(<StarRating value={3.6} readOnly />);
    expect(screen.getByLabelText('3.6 sur 5')).toBeInTheDocument();
  });

  it('has no interactive radio buttons', () => {
    render(<StarRating value={3} readOnly />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });
});

describe('StarRating (interactive)', () => {
  it('renders 5 radio buttons in a radiogroup', () => {
    render(<StarRating value={2} onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('marks the current value as checked', () => {
    render(<StarRating value={3} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the clicked star number', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[3]); // 4th star = value 4
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('uses a custom aria-label on the group when provided', () => {
    render(<StarRating value={0} onChange={vi.fn()} ariaLabel="Noter Jean" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Noter Jean');
  });

  it('falls back to a translated default group label', () => {
    render(<StarRating value={0} onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Noter cette aide');
  });

  it('previews the hovered value and resets on mouse leave', () => {
    render(<StarRating value={1} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.mouseEnter(radios[3]);
    expect(radios[3].querySelector('svg')).toHaveClass('text-amber-400');

    fireEvent.mouseLeave(screen.getByRole('radiogroup'));
    // Back to the actual value (1 star) once the mouse leaves the group.
    expect(radios[3].querySelector('svg')).toHaveClass('text-gray-300');
    expect(radios[0].querySelector('svg')).toHaveClass('text-amber-400');
  });

  it('does not throw when clicked without an onChange handler', () => {
    render(<StarRating value={0} />);
    const radios = screen.getAllByRole('radio');
    expect(() => fireEvent.click(radios[0])).not.toThrow();
  });

  it('applies the small size class when size="sm"', () => {
    render(<StarRating value={0} onChange={vi.fn()} size="sm" />);
    const svg = screen.getAllByRole('radio')[0].querySelector('svg');
    expect(svg).toHaveClass('w-4', 'h-4');
  });

  it('applies a custom className', () => {
    render(<StarRating value={0} onChange={vi.fn()} className="my-extra-class" />);
    expect(screen.getByRole('radiogroup')).toHaveClass('my-extra-class');
  });
});
