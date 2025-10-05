import { z } from 'zod';

export const createTicketSchema = z.object({
  userId: z
    .string({ message: 'ID do usuário é obrigatório' })
    .min(1, 'ID do usuário não pode ser vazio'),
  eventId: z
    .string({ message: 'ID do evento é obrigatório' })
    .min(1, 'ID do evento não pode ser vazio'),
  price: z
    .number({ message: 'Preço é obrigatório' })
    .positive('Preço deve ser positivo')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais')
    .max(999999.99, 'Preço máximo excedido'),
});

export const updateTicketSchema = z
  .object({
    price: z
      .number()
      .positive('Preço deve ser positivo')
      .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais')
      .max(999999.99, 'Preço máximo excedido')
      .optional(),
    isUsed: z
      .boolean({ message: 'isUsed deve ser verdadeiro ou falso' })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
