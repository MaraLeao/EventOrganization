import { z } from 'zod';

export const loginSchema = z.object({
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

export type LoginInput = z.infer<typeof loginSchema>;
