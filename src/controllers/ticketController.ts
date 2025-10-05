import type { Request, Response } from 'express';
import { TicketModel } from '../models/ticketModel.js';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticketSchema.js';

const ticketModel = new TicketModel();

export class TicketController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createTicketSchema.parse(req.body);
      const ticket = await ticketModel.create(validatedData);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const tickets = await ticketModel.findAll();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const ticket = await ticketModel.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket não encontrado' });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validatedData = updateTicketSchema.parse(req.body);
      const ticket = await ticketModel.update(req.params.id, validatedData);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await ticketModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}