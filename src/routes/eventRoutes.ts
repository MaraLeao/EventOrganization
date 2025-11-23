import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';
import { authorizeRoles } from '../middlewares/authMiddleware.js';

export const router = Router();
const eventController = new EventController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do evento
 *         title:
 *           type: string
 *           description: Título do evento
 *           example: Show de Rock 2025
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descrição detalhada do evento
 *           example: Um evento incrível com as melhores bandas
 *         date:
 *           type: string
 *           format: date-time
 *           description: Data e hora do evento
 *           example: 2025-12-31T20:00:00Z
 *         location:
 *           type: string
 *           description: Local do evento
 *           example: Estádio Central, São Paulo
 *         maxCapacity:
 *           type: integer
 *           description: Capacidade máxima de participantes
 *           example: 5000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

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
 *                 description: Titulo do evento
 *               description:
 *                 type: string
 *                 description: Descrição do evento
 *               date:
 *                 type: string
 *                 description: Data do evento
 *                 example: 2025-12-31T20:00:00Z
 *               location:
 *                 type: string
 *                 description: Localização
 *               maxCapacity:
 *                 type: number
 *                 description: Quantidade máxima de pessoas
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authorizeRoles('ADMIN'), (req, res) => eventController.create(req, res));

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
 *                 $ref: '#/components/schemas/Event'
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
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id', (req, res) => eventController.findOne(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Editar um evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 description: Titulo do evento
 *               description:
 *                 type: string
 *                 description: Descrição do evento
 *               date:
 *                 type: string
 *                 description: Data do evento
 *                 example: 2025-12-31T20:00:00Z
 *               location:
 *                 type: string
 *                 description: Localização
 *               maxCapacity:
 *                 type: number
 *                 description: Quantidade máxima de pessoas
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', authorizeRoles('ADMIN'), (req, res) => eventController.update(req, res));

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
 *           format: uuid
 *         description: ID do evento
 *     responses:
 *       204:
 *         description: Evento deletado com sucesso
 *       404:
 *         description: Evento não encontrado
 *       400:
 *         description: Não é possível deletar evento com ingressos associados
 */
router.delete('/:id', authorizeRoles('ADMIN'), (req, res) => eventController.delete(req, res));

export default router;
