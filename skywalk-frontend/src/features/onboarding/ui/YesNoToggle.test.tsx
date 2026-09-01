import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import YesNoToggle from './YesNoToggle';

describe('YesNoToggle', () => {
  it('renders the default labels', () => {
    render(<YesNoToggle />);
    expect(screen.getByText('Oui')).toBeInTheDocument();
    expect(screen.getByText('Non')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(<YesNoToggle yesLabel="Yes" noLabel="No" />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onChange with true when "Oui" is clicked', () => {
    const onChange = vi.fn();
    render(<YesNoToggle onChange={onChange} />);
    fireEvent.click(screen.getByText('Oui'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when "Non" is clicked', () => {
    const onChange = vi.fn();
    render(<YesNoToggle onChange={onChange} />);
    fireEvent.click(screen.getByText('Non'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('marks the selected option as checked', () => {
    render(<YesNoToggle value={true} />);
    expect(screen.getByText('Oui')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Non')).toHaveAttribute('aria-checked', 'false');
  });
});
