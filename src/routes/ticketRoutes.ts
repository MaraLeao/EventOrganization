import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';

export const router = Router();
const ticketController = new TicketController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do ticket
 *         userId:
 *           type: string
 *           description: ID do usuário que comprou o ticket
 *         eventId:
 *           type: string
 *           description: ID do evento
 *         price:
 *           type: number
 *           format: decimal
 *           description: Preço do ticket (com 2 casas decimais)
 *         isUsed:
 *           type: boolean
 *           description: Indica se o ticket já foi utilizado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do ticket
 *     TicketInput:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - price
 *       properties:
 *         userId:
 *           type: string
 *           description: ID do usuário
 *         eventId:
 *           type: string
 *           description: ID do evento
 *         price:
 *           type: number
 *           format: decimal
 *           description: Preço do ticket
 *           example: 50.00
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Criar novo ticket (comprar ingresso)
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
<<<<<<< HEAD
 *             $ref: '#/components/schemas/TicketInput'
=======
 *             type: object
 *             required:
 *               - userId
 *               - eventId
 *               - price
 *               - isUsed
 *             properties:
 *               userId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               price:
 *                 type: number
 *               isUsed:
 *                 type: boolean
>>>>>>> b64e7c6d847aeec131ab458d46a67a5586a75e3a
 *     responses:
 *       201:
 *         description: Ticket criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Dados inválidos ou evento sem capacidade
 *       409:
 *         description: Usuário já possui ticket para este evento
 *       404:
 *         description: Usuário ou evento não encontrado
 */
router.post('/', (req, res) => ticketController.create(req, res));

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Listar todos os tickets
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar tickets por ID do usuário
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filtrar tickets por ID do evento
 *       - in: query
 *         name: isUsed
 *         schema:
 *           type: boolean
 *         description: Filtrar tickets por status de uso
 *     responses:
 *       200:
 *         description: Lista de tickets retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
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
 *         description: ID do ticket
 *     responses:
 *       200:
 *         description: Ticket encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket não encontrado
 */
router.get('/:id', (req, res) => ticketController.findOne(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Atualizar ticket (marcar como usado)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isUsed:
 *                 type: boolean
 *                 description: Marcar ticket como usado/não usado
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Atualizar preço do ticket
 *     responses:
 *       200:
 *         description: Ticket atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Ticket não encontrado
 */
router.put('/:id', (req, res) => ticketController.update(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Deletar ticket (cancelar ingresso)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do ticket
 *     responses:
 *       204:
 *         description: Ticket deletado com sucesso
 *       404:
 *         description: Ticket não encontrado
 *       400:
 *         description: Não é possível deletar ticket já utilizado
 */
router.delete('/:id', (req, res) => ticketController.delete(req, res));

export default router;
