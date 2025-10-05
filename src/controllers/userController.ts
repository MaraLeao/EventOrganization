import type { Request, Response } from 'express';
import { UserModel } from '../models/userModel.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';

const userModel = new UserModel();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await userModel.create(validatedData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await userModel.findAll();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const user = await userModel.update(req.params.id, validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await userModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}