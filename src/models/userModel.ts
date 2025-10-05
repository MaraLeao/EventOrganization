import { prisma } from '../config/database.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';
import type { z } from 'zod';

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UserModel {
  async create(data: CreateUserInput) {
    return await prisma.user.create({ data });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        tickets: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return await prisma.user.delete({ where: { id } });
  }
}
