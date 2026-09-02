import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuddyList from './BuddyList';

const mockedUseBuddies = vi.fn();
vi.mock('../hooks/useBuddies', () => ({
  useBuddies: (...args: any[]) => mockedUseBuddies(...args),
}));

vi.mock('./BuddyContactButtons', () => ({
  default: (props: any) => (
    <div data-testid={`contact-buttons-${props.recipientId}`} />
  ),
}));

describe('BuddyList', () => {
  beforeEach(() => {
    mockedUseBuddies.mockReset();
  });

  it('renders nothing when the buddies query errors out', () => {
    mockedUseBuddies.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    const { container } = render(
      <BuddyList procedureId={5} procedureTitle="Visa" countryId={10} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a loading skeleton while fetching', () => {
    mockedUseBuddies.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = render(
      <BuddyList procedureId={5} procedureTitle="Visa" countryId={10} />,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('invites the user to be first when no one has completed the step', () => {
    mockedUseBuddies.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<BuddyList procedureId={5} procedureTitle="Visa" countryId={10} />);
    expect(
      screen.getByText(/Sois le premier a partager ton experience/),
    ).toBeInTheDocument();
  });

  it('lists each buddy with their origin country and days-ago label, plus contact actions', () => {
    mockedUseBuddies.mockReturnValue({
      data: [
        { idUser: 1, firstname: 'Jane', originCountry: 'Germany', completedAt: new Date().toISOString() },
        { idUser: 2, firstname: 'Marco', originCountry: '', completedAt: new Date(Date.now() - 86400000).toISOString() },
      ],
      isLoading: false,
      isError: false,
    });

    render(<BuddyList procedureId={5} procedureTitle="Visa" countryId={10} />);

    expect(screen.getByText('2 personnes ont fait cette etape')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('- Germany')).toBeInTheDocument();
    expect(screen.getByText("aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText('hier')).toBeInTheDocument();
    expect(screen.getByTestId('contact-buttons-1')).toBeInTheDocument();
    expect(screen.getByTestId('contact-buttons-2')).toBeInTheDocument();
  });

  it('uses the singular header for a single buddy', () => {
    mockedUseBuddies.mockReturnValue({
      data: [{ idUser: 1, firstname: 'Jane', originCountry: 'Germany', completedAt: new Date().toISOString() }],
      isLoading: false,
      isError: false,
    });

    render(<BuddyList procedureId={5} procedureTitle="Visa" countryId={10} />);

    expect(screen.getByText('1 personne a fait cette etape')).toBeInTheDocument();
  });
});
