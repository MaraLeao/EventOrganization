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
 *               - date
 *               - location
 *               - maxCapacity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do evento
 *               description:
 *                 type: string
 *                 description: Descrição do evento (opcional)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora do evento
 *               location:
 *                 type: string
<<<<<<< HEAD
 *                 description: Local do evento
=======
>>>>>>> b64e7c6d847aeec131ab458d46a67a5586a75e3a
 *               maxCapacity:
 *                 type: integer
 *                 description: Capacidade máxima de participantes
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *       400:
 *         description: Dados inválidos
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
 *         description: Lista de eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
 *                   maxCapacity:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
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
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento não encontrado
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
 *         description: ID do evento
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
 *               maxCapacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *       404:
 *         description: Evento não encontrado
 *       400:
 *         description: Dados inválidos
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
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Evento deletado com sucesso
 *       404:
 *         description: Evento não encontrado
 *       400:
 *         description: Não é possível deletar evento com ingressos associados
 */
router.delete('/:id', (req, res) => eventController.delete(req, res));

export default router;
