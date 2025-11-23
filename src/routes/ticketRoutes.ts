import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';
import { authorizeRoles } from '../middlewares/authMiddleware.js';

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
 *           format: uuid
 *           description: ID único do ticket
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID do usuário que comprou o ticket
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: ID do evento
 *         price:
 *           type: number
 *           format: decimal
 *           description: Preço do ticket (com 2 casas decimais)
 *           example: 150.00
 *         isUsed:
 *           type: boolean
 *           description: Indica se o ticket já foi utilizado
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do ticket
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
 *             type: object
 *             required:
 *               - userId
 *               - eventId
 *               - price
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do evento
 *                 example: 660e8400-e29b-41d4-a716-446655440000
 *               price:
 *                 type: number
 *                 description: Preço do ingresso
 *                 example: 150.00
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
 *           format: uuid
 *         description: Filtrar tickets por ID do usuário
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *           format: uuid
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
 *           format: uuid
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

router.post('/:id/use', (req, res) => ticketController.useTicket(req, res));

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Atualizar ticket (marcar como usado ou alterar preço)
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 example: true
 *               price:
 *                 type: number
 *                 format: decimal
 *                 description: Atualizar preço do ticket
 *                 example: 200.00
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
router.put('/:id', authorizeRoles('ADMIN'), (req, res) => ticketController.update(req, res));

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
 *           format: uuid
 *         description: ID do ticket
 *     responses:
 *       204:
 *         description: Ticket deletado com sucesso
 *       404:
 *         description: Ticket não encontrado
 *       400:
 *         description: Não é possível deletar ticket já utilizado
 */
router.delete('/:id', authorizeRoles('ADMIN'), (req, res) => ticketController.delete(req, res));

export default router;
