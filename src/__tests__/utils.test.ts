import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, getDaysUntilDeadline } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date in Spanish locale', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('marzo');
    expect(result).toContain('2024');
  });
});

describe('formatCurrency', () => {
  it('formats as Colombian pesos', () => {
    const result = formatCurrency(2800000);
    expect(result).toContain('2.800.000');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('getDaysUntilDeadline', () => {
  it('returns positive for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(getDaysUntilDeadline(futureDate.toISOString())).toBe(10);
  });

  it('returns negative for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(getDaysUntilDeadline(pastDate.toISOString())).toBe(-5);
  });
});
