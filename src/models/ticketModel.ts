import { prisma } from '../config/database.js';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticketSchema.js';
import type { z } from 'zod';

type CreateTicketInput = z.infer<typeof createTicketSchema>;
type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export class TicketModel {
  async create(data: CreateTicketInput) {
    return await prisma.ticket.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });
  }

  async findAll() {
    return await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return await prisma.ticket.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });
  }

  async findById(id: string) {
    return await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });
  }

  async update(id: string, data: UpdateTicketInput) {
    return await prisma.ticket.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: true,
      },
    });
  }

  async delete(id: string) {
    return await prisma.ticket.delete({ where: { id } });
  }
}
