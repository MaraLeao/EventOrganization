import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').optional(),
  date: z.string().datetime('Data inválida'),
  location: z.string().min(3, 'Localização deve ter no mínimo 3 caracteres'),
  maxCapacity: z.number().int().positive('Capacidade deve ser um número inteiro positivo'),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  date: z.string().datetime().optional(),
  location: z.string().min(3).optional(),
  maxCapacity: z.number().int().positive().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;