import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middlewares/authMiddleware.js';

const app = express();

app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/events', authenticate, eventRoutes);
app.use('/api/tickets', authenticate, ticketRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API de Eventos',
    documentation: '/api-docs',
  });
});

export default app;
