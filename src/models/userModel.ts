import { prisma } from '../config/database.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';
import type { z } from 'zod';
import bcrypt from 'bcryptjs';

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UserModel {
  async create(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role ?? 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
    const payload = { ...data } as UpdateUserInput & { password?: string };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return await prisma.user.delete({ where: { id } });
  }
}
