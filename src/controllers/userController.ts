import type { Response } from 'express';
import { UserModel } from '../models/userModel.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

const userModel = new UserModel();

export class UserController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await userModel.create(validatedData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await userModel.findAll();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findOne(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const user = await userModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const validatedData = updateUserSchema.parse(req.body);
      if (req.user.role !== 'ADMIN') {
        delete (validatedData as { role?: string }).role;
      }
      const user = await userModel.update(req.params.id, validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      await userModel.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
