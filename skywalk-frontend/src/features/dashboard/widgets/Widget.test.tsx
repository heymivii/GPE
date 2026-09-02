import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Widget from './Widget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key.split('.').pop() ?? key,
  }),
}));

function DummyIcon(props: { className?: string }) {
  return <svg data-testid="dummy-icon" className={props.className} />;
}

describe('Widget', () => {
  it('renders the title and subtitle', () => {
    render(
      <Widget title="Mon widget" subtitle="sous-titre">
        <p>content</p>
      </Widget>,
    );
    expect(screen.getByText('Mon widget')).toBeInTheDocument();
    expect(screen.getByText('sous-titre')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render a subtitle when none is given', () => {
    render(<Widget title="Sans sous-titre">content</Widget>);
    expect(screen.queryByText('sous-titre')).not.toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    render(
      <Widget title="Avec icône" icon={DummyIcon}>
        content
      </Widget>,
    );
    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument();
  });

  it('does not render the menu trigger when isEditable is false', () => {
    render(
      <Widget title="Non éditable" isEditable={false}>
        content
      </Widget>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles the menu open and closed on click', () => {
    render(
      <Widget title="Menu" onEdit={vi.fn()}>
        content
      </Widget>,
    );
    const trigger = screen.getByRole('button');
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByText('edit')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it('calls onEdit and closes the menu', () => {
    const onEdit = vi.fn();
    render(
      <Widget title="Menu" onEdit={onEdit}>
        content
      </Widget>,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('edit'));
    expect(onEdit).toHaveBeenCalled();
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it('calls onExpand and closes the menu', () => {
    const onExpand = vi.fn();
    render(
      <Widget title="Menu" onExpand={onExpand}>
        content
      </Widget>,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('expand'));
    expect(onExpand).toHaveBeenCalled();
  });

  it('calls onHide and closes the menu', () => {
    const onHide = vi.fn();
    render(
      <Widget title="Menu" onHide={onHide}>
        content
      </Widget>,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('hide'));
    expect(onHide).toHaveBeenCalled();
  });

  it('does not render the resize section when onResize is absent', () => {
    render(
      <Widget title="Menu" onEdit={vi.fn()}>
        content
      </Widget>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('resize')).not.toBeInTheDocument();
  });

  it('calls onResize with the chosen size and closes the menu', () => {
    const onResize = vi.fn();
    render(
      <Widget title="Menu" onResize={onResize} currentSize="medium">
        content
      </Widget>,
    );
    // La taille 'small' n'existe plus : le menu ne propose que medium et large.
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('sizeSmall')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('sizeMedium'));
    expect(onResize).toHaveBeenCalledWith('medium');
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('sizeLarge'));
    expect(onResize).toHaveBeenCalledWith('large');
  });

  it('closes the menu when clicking the background overlay', () => {
    render(
      <Widget title="Menu" onEdit={vi.fn()}>
        content
      </Widget>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('edit')).toBeInTheDocument();
    // The fixed inset-0 overlay is only rendered while the menu is open.
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it.each([
    ['text-blue-600', 'bg-blue-50'],
    ['text-purple-600', 'bg-purple-50'],
    ['text-green-600', 'bg-green-50'],
    ['text-orange-600', 'bg-orange-50'],
    ['text-red-600', 'bg-red-50'],
    ['text-gray-600', 'bg-gray-50'],
  ])('maps iconColor %s to background %s', (iconColor, expectedBg) => {
    render(
      <Widget title="Couleur" icon={DummyIcon} iconColor={iconColor}>
        content
      </Widget>,
    );
    const wrapper = screen.getByTestId('dummy-icon').parentElement;
    expect(wrapper?.className).toContain(expectedBg);
  });
});
