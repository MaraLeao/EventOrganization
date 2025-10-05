import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';

export const router = Router();
const ticketController = new TicketController();

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Criar novo ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eventId
 *             properties:
 *               userId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket criado
 */
router.post('/', (req, res) => ticketController.create(req, res));

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Listar todos os tickets
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Lista de tickets
 */
router.get('/', (req, res) => ticketController.findAll(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Buscar ticket por ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket encontrado
 */
router.get('/:id', (req, res) => ticketController.findOne(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Atualizar ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket atualizado
 */
router.put('/:id', (req, res) => ticketController.update(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Deletar ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Ticket deletado
 */
router.delete('/:id', (req, res) => ticketController.delete(req, res));

export default router;
