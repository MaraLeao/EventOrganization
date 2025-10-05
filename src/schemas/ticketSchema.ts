import { z } from 'zod';

export const createTicketSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  eventId: z.string().uuid('ID do evento inválido'),
  status: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;