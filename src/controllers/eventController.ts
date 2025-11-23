import type { Response } from 'express';
import { EventModel } from '../models/eventModel.js';
import { createEventSchema, updateEventSchema } from '../schemas/eventSchema.js';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

const eventModel = new EventModel();

export class EventController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      const validatedData = createEventSchema.parse(req.body);
      const event = await eventModel.create(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response) {
    try {
      const events = await eventModel.findAll();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: AuthenticatedRequest, res: Response) {
    try {
      const event = await eventModel.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      const validatedData = updateEventSchema.parse(req.body);
      const event = await eventModel.update(req.params.id, validatedData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await eventModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
