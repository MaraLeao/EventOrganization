import { z } from 'zod';

export const createTicketSchema = z.object({
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  eventId: z.string().uuid('ID do evento deve ser um UUID válido'),
  price: z.number().positive('Preço deve ser um número positivo'),
});

export const updateTicketSchema = z.object({
  price: z.number().positive('Preço deve ser um número positivo').optional(),
  isUsed: z.boolean().optional(),
});

export const useTicketSchema = z.object({
  isUsed: z.literal(true, {
    errorMap: () => ({ message: 'Ticket só pode ser marcado como usado' })
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UseTicketInput = z.infer<typeof useTicketSchema>;