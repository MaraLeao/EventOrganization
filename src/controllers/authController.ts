import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { createUserSchema } from '../schemas/userSchema.js';
import { loginSchema } from '../schemas/authSchema.js';
import { prisma } from '../config/database.js';

const userModel = new UserModel();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const existingUsers = await prisma.user.count();
      const enforcedRole = existingUsers === 0 ? 'ADMIN' : 'USER';
      const user = await userModel.create({ ...validatedData, role: enforcedRole });
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' },
      );

      res.status(201).json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await userModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' },
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
