import type { Request, Response } from 'express';
import { EventModel } from '../models/eventModel.js';
import { createEventSchema, updateEventSchema } from '../schemas/eventSchema.js';

const eventModel = new EventModel();

export class EventController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createEventSchema.parse(req.body);
      const event = await eventModel.create(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const events = await eventModel.findAll();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
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

  async update(req: Request, res: Response) {
    try {
      const validatedData = updateEventSchema.parse(req.body);
      const event = await eventModel.update(req.params.id, validatedData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await eventModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}