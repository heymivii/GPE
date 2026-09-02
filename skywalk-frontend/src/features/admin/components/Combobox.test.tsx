import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Combobox from './Combobox';

const options = ['Paris', 'Lyon', 'Marseille', 'Lille'];

describe('Combobox', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('does not show the option list before the input is focused', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows every option on focus when the value is empty', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Lille')).toBeInTheDocument();
  });

  it('filters options case-insensitively as the user types', () => {
    render(<Combobox options={options} value="par" onChange={onChange} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByText('Lyon')).not.toBeInTheDocument();
  });

  it('calls onChange as the user types', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Ly' } });
    expect(onChange).toHaveBeenCalledWith('Ly');
  });

  it('selects an option on click', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getByText('Lyon'));
    expect(onChange).toHaveBeenCalledWith('Lyon');
  });

  it('shows a "no match" hint when nothing matches a non-empty query', () => {
    render(<Combobox options={options} value="zzz" onChange={onChange} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByText(/Aucune correspondance/)).toBeInTheDocument();
  });

  it('caps rendered results at maxResults and shows a remainder count', () => {
    render(<Combobox options={options} value="" onChange={onChange} maxResults={2} />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').length).toBe(2);
    expect(screen.getByText(/autres… affine ta recherche/)).toBeInTheDocument();
  });

  it('navigates and selects with the keyboard', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('Lyon');
  });

  it('closes on Escape', () => {
    render(<Combobox options={options} value="" onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open the list when disabled', () => {
    render(<Combobox options={options} value="" onChange={onChange} disabled />);
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the component', () => {
    render(
      <div>
        <Combobox options={options} value="" onChange={onChange} />
        <button>outside</button>
      </div>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
