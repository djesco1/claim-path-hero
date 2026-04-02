import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, newClaimStep2Schema } from '@/schemas';

describe('loginSchema', () => {
  it('passes with valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password1' });
    expect(result.success).toBe(false);
  });

  it('fails with short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('fails with missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validInput = {
    full_name: 'Juan Pérez',
    email: 'juan@example.com',
    country: 'Colombia',
    password: 'Password1',
    confirmPassword: 'Password1',
    acceptTerms: true,
  };

  it('passes with valid input', () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('fails when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...validInput, confirmPassword: 'Different1' });
    expect(result.success).toBe(false);
  });

  it('fails with short name', () => {
    const result = registerSchema.safeParse({ ...validInput, full_name: 'A' });
    expect(result.success).toBe(false);
  });
});

describe('newClaimStep2Schema', () => {
  it('fails when description is too short', () => {
    const result = newClaimStep2Schema.safeParse({
      situation_description: 'Too short',
      counterparty_name: 'Empresa X',
      counterparty_type: 'company',
      incident_date: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('passes with valid input', () => {
    const result = newClaimStep2Schema.safeParse({
      situation_description: 'A'.repeat(150),
      counterparty_name: 'Empresa X',
      counterparty_type: 'company',
      incident_date: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });
});
