import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, ClaimTypeBadge } from '@/components/shared';

describe('StatusBadge', () => {
  it('renders correct label for draft', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('renders correct label for in_progress', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('En proceso')).toBeInTheDocument();
  });

  it('renders correct label for sent', () => {
    render(<StatusBadge status="sent" />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renders correct label for resolved', () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resuelta')).toBeInTheDocument();
  });

  it('renders correct label for closed', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Cerrada')).toBeInTheDocument();
  });
});

describe('ClaimTypeBadge', () => {
  it('renders label for landlord_deposit', () => {
    render(<ClaimTypeBadge type="landlord_deposit" />);
    expect(screen.getByText('Arrendamiento')).toBeInTheDocument();
  });

  it('renders label for wrongful_termination', () => {
    render(<ClaimTypeBadge type="wrongful_termination" />);
    expect(screen.getByText('Laboral')).toBeInTheDocument();
  });
});
