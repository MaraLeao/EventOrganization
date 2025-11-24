import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')           // substitui required_error
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')          // substitui required_error
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')          // substitui required_error
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
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
      .trim()
      .toLowerCase()
      .min(1, 'Email não pode ser vazio')
      .optional(),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
  })
  .refine((data: {}) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
