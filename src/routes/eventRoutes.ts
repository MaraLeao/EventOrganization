import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';

export const router = Router();
const eventController = new EventController();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Criar novo evento
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - location
 *               - maxCapacity
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               maxCapacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Evento criado
 */
router.post('/', (req, res) => eventController.create(req, res));

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Listar todos os eventos
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get('/', (req, res) => eventController.findAll(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Buscar evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento encontrado
 */
router.get('/:id', (req, res) => eventController.findOne(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Atualizar evento
 *     tags: [Events]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Evento atualizado
 */
router.put('/:id', (req, res) => eventController.update(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Deletar evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Evento deletado
 */
router.delete('/:id', (req, res) => eventController.delete(req, res));

export default router;
