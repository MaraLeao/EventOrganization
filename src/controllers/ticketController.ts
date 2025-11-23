import type { Response } from 'express';
import { TicketModel } from '../models/ticketModel.js';
import { createTicketSchema, purchaseTicketSchema, updateTicketSchema } from '../schemas/ticketSchema.js';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { prisma } from '../config/database.js';

const ticketModel = new TicketModel();

export class TicketController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      if (req.user.role === 'ADMIN') {
        const validatedData = createTicketSchema.parse(req.body);
        const ticket = await ticketModel.create(validatedData);
        return res.status(201).json(ticket);
      }

      const { eventId, quantity } = purchaseTicketSchema.parse(req.body);
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { price: true },
      });

      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticket = await ticketModel.create({
          userId: req.user.id,
          eventId,
          price: Number(event.price),
        });
        tickets.push(ticket);
      }

      res.status(201).json({ tickets, quantity: tickets.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const tickets =
        req.user.role === 'ADMIN'
          ? await ticketModel.findAll()
          : await ticketModel.findByUserId(req.user.id);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const ticket = await ticketModel.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' });
      }
      if (req.user.role !== 'ADMIN' && ticket.user?.id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      const validatedData = updateTicketSchema.parse(req.body);
      const ticket = await ticketModel.update(req.params.id, validatedData);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await ticketModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
