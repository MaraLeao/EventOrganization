import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
      invalid_type_error: 'Nome deve ser uma string',
    })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser uma string',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser uma string',
    })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase()
      .trim()
      .optional(),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .optional(),
  })
  .refine((data: {}) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
