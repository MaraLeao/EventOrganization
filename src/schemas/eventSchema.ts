import { z } from 'zod';

const ticketTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do tipo é obrigatório')
    .min(2, 'Nome do tipo deve ter ao menos 2 caracteres')
    .max(100, 'Nome do tipo deve ter no máximo 100 caracteres')
    .trim(),

  price: z
    .number()
    .min(0, 'Preço é obrigatório')
    .max(999999.99, 'Preço máximo excedido'),

  quantity: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .positive('Quantidade deve ser positiva')
    .max(1000000, 'Quantidade máxima excedida'),
});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),

  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim()
    .optional(),

  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .datetime('Data inválida. Use formato ISO 8601')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Data do evento deve ser futura',
    }),

  location: z
    .string()
    .min(1, 'Localização é obrigatória')
    .min(3, 'Localização deve ter no mínimo 3 caracteres')
    .max(300, 'Localização deve ter no máximo 300 caracteres')
    .trim(),

  maxCapacity: z
    .number()
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser positiva')
    .min(1, 'Capacidade é obrigatória')
    .max(1000000, 'Capacidade máxima excedida'),

  ticketTypes: z
    .array(ticketTypeSchema)
    .min(1, 'Defina pelo menos um tipo de ingresso')
    .max(50, 'Número máximo de tipos excedido'),
});

export const updateEventSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Título deve ter no mínimo 3 caracteres')
      .max(200, 'Título deve ter no máximo 200 caracteres')
      .trim()
      .optional(),

    description: z
      .string()
      .min(10, 'Descrição deve ter no mínimo 10 caracteres')
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
      .trim()
      .optional(),

    date: z
      .string()
      .datetime('Data inválida. Use formato ISO 8601')
      .refine((date) => new Date(date) > new Date(), {
        message: 'Data do evento deve ser futura',
      })
      .optional(),

    location: z
      .string()
      .min(3, 'Localização deve ter no mínimo 3 caracteres')
      .max(300, 'Localização deve ter no máximo 300 caracteres')
      .trim()
      .optional(),

    maxCapacity: z
      .number()
      .int('Capacidade deve ser um número inteiro')
      .positive('Capacidade deve ser positiva')
      .min(1, 'Capacidade deve ser no mínimo 1')
      .max(1000000, 'Capacidade máxima excedida')
      .optional(),

    ticketTypes: z
      .array(
        ticketTypeSchema.partial().extend({
          id: z.string().uuid().optional(),
        }),
      )
      .max(50, 'Número máximo de tipos excedido')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
