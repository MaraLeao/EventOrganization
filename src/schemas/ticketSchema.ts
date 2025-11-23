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

export const purchaseTicketSchema = z.object({
  eventId: z
    .string({ message: 'ID do evento é obrigatório' })
    .min(1, 'ID do evento não pode ser vazio'),
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .positive('Quantidade deve ser positiva')
    .min(1, 'Compra mínima de 1 ingresso')
    .max(20, 'Quantidade máxima de 20 ingressos por compra')
    .default(1),
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
  .refine((data: {}) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
