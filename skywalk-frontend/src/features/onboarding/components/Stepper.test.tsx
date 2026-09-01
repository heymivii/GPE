import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Stepper, { type Step } from './Stepper';

const steps: Step[] = [
  { id: 1, label: 'Destination', state: 'done' },
  { id: 2, label: 'Profil', state: 'current' },
  { id: 3, label: 'Objectif', state: 'todo' },
];

describe('Stepper', () => {
  it('renders every step label', () => {
    render(<Stepper steps={steps} />);
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Objectif')).toBeInTheDocument();
  });

  it('shows a checkmark for a done step and the number for others', () => {
    const { container } = render(<Stepper steps={steps} />);
    expect(container.querySelector('.lucide-check')).not.toBeNull();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('disables a todo step and calls onStepClick for a clickable one', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} onStepClick={onStepClick} />);
    const todoButton = screen.getByText('3').closest('button')!;
    expect(todoButton).toBeDisabled();
    fireEvent.click(screen.getByText('2').closest('button')!);
    expect(onStepClick).toHaveBeenCalledWith(2);
  });
});
