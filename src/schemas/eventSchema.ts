import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string({ message: 'Título é obrigatório' })
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
    .string({ message: 'Data é obrigatória' })
    .datetime('Data inválida. Use formato ISO 8601')
    .refine((date: string | number | Date) => new Date(date) > new Date(), {
      message: 'Data do evento deve ser futura',
    }),
  location: z
    .string({ message: 'Localização é obrigatória' })
    .min(3, 'Localização deve ter no mínimo 3 caracteres')
    .max(300, 'Localização deve ter no máximo 300 caracteres')
    .trim(),
  maxCapacity: z
    .number({ message: 'Capacidade máxima é obrigatória' })
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser positiva')
    .min(1, 'Capacidade deve ser no mínimo 1')
    .max(1000000, 'Capacidade máxima excedida'),
  price: z
    .number({ message: 'Preço é obrigatório' })
    .positive('Preço deve ser positivo')
    .max(999999.99, 'Preço máximo excedido'),
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
      .refine((date: string | number | Date) => new Date(date) > new Date(), {
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
    price: z
      .number()
      .positive('Preço deve ser positivo')
      .max(999999.99, 'Preço máximo excedido')
      .optional(),
  })
  .refine((data: {}) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
