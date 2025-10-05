import { prisma } from '../config/database.js';
import { createEventSchema, updateEventSchema } from '../schemas/eventSchema.js';
import type { z } from 'zod';

type CreateEventInput = z.infer<typeof createEventSchema>;
type UpdateEventInput = z.infer<typeof updateEventSchema>;

export class EventModel {
  async create(data: CreateEventInput) {
    return await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async findAll() {
    return await prisma.event.findMany({
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { tickets: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateEventInput) {
    return await prisma.event.update({
      where: { id },
      data: data.date ? { ...data, date: new Date(data.date) } : data,
    });
  }

  async delete(id: string) {
    return await prisma.event.delete({ where: { id } });
  }
}