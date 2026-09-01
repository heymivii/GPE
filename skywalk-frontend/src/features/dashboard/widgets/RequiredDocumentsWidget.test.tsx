import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import RequiredDocumentsWidget from './RequiredDocumentsWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const dv = opts?.defaultValue ?? key;
      if (!opts) return dv;
      return String(dv).replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => (opts[k] !== undefined ? String(opts[k]) : `{{${k}}}`));
    },
  }),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);

function renderWidget(props: any) {
  return render(
    <MemoryRouter>
      <RequiredDocumentsWidget {...props} />
    </MemoryRouter>,
  );
}

describe('RequiredDocumentsWidget', () => {
  it('shows a no-project message when there is no projectId', () => {
    mockedUseQuery.mockReturnValue({ data: [], isLoading: false } as any);
    renderWidget({});
    expect(screen.getByText('Sélectionnez un projet pour suivre vos documents.')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    mockedUseQuery.mockReturnValue({ data: [], isLoading: true } as any);
    const { container } = renderWidget({ projectId: 1 });
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows the checklist with the correct progress count', () => {
    mockedUseQuery.mockReturnValue({ data: [{ docType: 'passport' }, { docType: 'visa' }], isLoading: false } as any);
    renderWidget({ projectId: 1 });
    expect(screen.getByText('2/6 documents-clés')).toBeInTheDocument();
    expect(screen.getByText('passport')).toBeInTheDocument();
  });

  it('offers to add documents when the checklist is incomplete', () => {
    mockedUseQuery.mockReturnValue({ data: [], isLoading: false } as any);
    renderWidget({ projectId: 1 });
    expect(screen.getByText('Ajouter des documents')).toBeInTheDocument();
  });

  it('offers to manage documents once the checklist is complete', () => {
    mockedUseQuery.mockReturnValue({
      data: [
        { docType: 'passport' }, { docType: 'visa' }, { docType: 'id_card' },
        { docType: 'residence_permit' }, { docType: 'work_contract' }, { docType: 'birth_certificate' },
      ],
      isLoading: false,
    } as any);
    renderWidget({ projectId: 1 });
    expect(screen.getByText('Gérer mes documents')).toBeInTheDocument();
  });
});
