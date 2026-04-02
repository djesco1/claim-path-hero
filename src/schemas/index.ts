import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  country: z.string().min(1, 'Selecciona un país'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  country: z.string().min(1, 'Selecciona un país'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

export const newClaimStep2Schema = z.object({
  situation_description: z.string()
    .min(100, 'Describe tu situación con al menos 100 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),
  counterparty_name: z.string().min(2, 'Nombre requerido'),
  counterparty_type: z.enum(['person', 'company', 'government_entity'], {
    required_error: 'Selecciona el tipo de contraparte',
  }),
  amount_involved: z.number().positive('El monto debe ser positivo').nullable().optional(),
  incident_date: z.string().refine(date => new Date(date) <= new Date(), {
    message: 'La fecha no puede ser en el futuro',
  }),
});

export const addTimelineNoteSchema = z.object({
  event_type: z.enum(['created', 'document_generated', 'sent', 'response_received', 'escalated', 'resolved'], {
    required_error: 'Selecciona el tipo de evento',
  }),
  note: z.string().min(1, 'La nota es requerida').max(500, 'Máximo 500 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type NewClaimStep2Input = z.infer<typeof newClaimStep2Schema>;
export type AddTimelineNoteInput = z.infer<typeof addTimelineNoteSchema>;
