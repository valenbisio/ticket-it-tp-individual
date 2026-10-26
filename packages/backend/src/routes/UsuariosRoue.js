import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { compraRepository } from "../data/seed.js";
import { CompraService } from "../services/CompraService.js";

const compraService = new CompraService({ compraRepository });
const compraController = new CompraController({ compraService });

const router = express.Router();

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras:
 *   get:
 *     summary: Obtener compras de un comprador
 *     description: >
 *       Devuelve las compras del comprador indicado, diferenciando el estado
 *       de cada una. Las compras en estado CONFIRMADA incluyen además cuántos
 *       días faltan para el evento.
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario comprador
 *     responses:
 *       200:
 *         description: Lista de compras del comprador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarioId:
 *                   type: string
 *                   example: "usuario-1"
 *                 compras:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompraSerializada'
 */
router
    .route("/:usuarioId/compras")
    .get( (req, res) => compraController.obtenerComprasDeUsuario(req, res),
);

export default router;