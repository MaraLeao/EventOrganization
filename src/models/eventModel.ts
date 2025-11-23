import { prisma } from '../config/database.js';
import { createEventSchema, updateEventSchema } from '../schemas/eventSchema.js';
import type { z } from 'zod';

type CreateEventInput = z.infer<typeof createEventSchema>;
type UpdateEventInput = z.infer<typeof updateEventSchema>;

const eventInclude = {
  ticketTypes: {
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  },
  tickets: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ticketType: true,
    },
  },
  _count: {
    select: { tickets: true },
  },
};

const ticketsLightInclude = {
  ticketTypes: {
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  },
  _count: {
    select: { tickets: true },
  },
};

const normalizeTicketType = (type: any) => ({
  id: type.id,
  name: (type.name ?? '').trim(),
  price: Number(type.price),
  quantity: Number(type.quantity),
});

export class EventModel {
  async create(data: CreateEventInput) {
    const { ticketTypes, ...eventData } = data;
    const normalizedTypes = ticketTypes.map(normalizeTicketType);

    return await prisma.event.create({
      data: {
        ...eventData,
        date: new Date(eventData.date),
        ticketTypes: {
          create: normalizedTypes.map((type) => ({
            name: type.name,
            price: type.price,
            quantity: type.quantity,
          })),
        },
      },
      include: eventInclude,
    });
  }

  async findAll() {
    return await prisma.event.findMany({
      include: ticketsLightInclude,
    });
  }

  async findById(id: string) {
    return await prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
  }

  async update(id: string, data: UpdateEventInput) {
    const { ticketTypes, ...eventData } = data;
    return await prisma.$transaction(async (tx) => {
      const eventUpdateData =
        eventData.date !== undefined
          ? { ...eventData, date: new Date(eventData.date) }
          : eventData;

      if (Object.keys(eventUpdateData).length > 0) {
        await tx.event.update({
          where: { id },
          data: eventUpdateData,
        });
      } else {
        await tx.event.findUniqueOrThrow({ where: { id } });
      }

      if (ticketTypes) {
        const normalizedTypes = ticketTypes.map(normalizeTicketType);
        const incomingIds = normalizedTypes
          .filter((type) => !!type.id)
          .map((type) => type.id as string);

        const existingTypes = await tx.ticketType.findMany({
          where: { eventId: id },
          include: {
            _count: {
              select: { tickets: true },
            },
          },
        });

        const typesToDelete = existingTypes.filter(
          (type) => !incomingIds.includes(type.id),
        );

        const blockedDeletions = typesToDelete.filter(
          (type) => type._count.tickets > 0,
        );

        if (blockedDeletions.length > 0) {
          throw new Error(
            `Não é possível remover tipos com ingressos vendidos: ${blockedDeletions
              .map((type) => type.name)
              .join(', ')}`,
          );
        }

        if (typesToDelete.length > 0) {
          await tx.ticketType.deleteMany({
            where: {
              id: { in: typesToDelete.map((type) => type.id) },
            },
          });
        }

        for (const type of normalizedTypes) {
          if (type.id) {
            await tx.ticketType.update({
              where: { id: type.id },
              data: {
                name: type.name,
                price: type.price,
                quantity: type.quantity,
              },
            });
          } else {
            await tx.ticketType.create({
              data: {
                eventId: id,
                name: type.name,
                price: type.price,
                quantity: type.quantity,
              },
            });
          }
        }
      }

      return await tx.event.findUnique({
        where: { id },
        include: eventInclude,
      });
    });
  }

  async delete(id: string) {
    return await prisma.event.delete({ where: { id } });
  }
}
