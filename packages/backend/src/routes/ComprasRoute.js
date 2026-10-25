import express from "express";
import { ColaboracionController } from "../controllers/CompraController.js";

const router = express.Router({ mergeParams: true });

const compraController = new CompraController();

  /**
   * @swagger
   * /api/usuarios/{usuarioId}/compras:
   *   get:
   *     summary: Obtener compras de un comprador
   *     description: >
   *       Devuelve las compras del comprador indicado, diferenciando el estado
   *       de cada una. Las compras en estado CONFIRMADA incluyen además cuántos
   *       días faltan para el evento.
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
   *
   * components:
   *   schemas:
   *     CompraSerializada:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         estado:
   *           type: string
   *           enum: [PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA]
   *         cantidad:
   *           type: integer
   *           example: 2
   *         total:
   *           type: number
   *           example: 30000
   *         tipoEntrada:
   *           type: object
   *           properties:
   *             nombre:
   *               type: string
   *               example: "General"
   *             precio:
   *               type: number
   *               example: 15000
   *         evento:
   *           type: object
   *           properties:
   *             nombre:
   *               type: string
   *               example: "Recital de Rock"
   *             descripcion:
   *               type: string
   *             fecha:
   *               type: string
   *               format: date-time
   *             categoria:
   *               type: string
   *               example: "Música"
   *             multimedia:
   *               type: array
   *               items:
   *                 type: string
   *         diasRestantesParaEvento:
   *           type: integer
   *           nullable: true
   *           description: >
   *             Días que faltan para el evento. Solo tiene valor cuando el
   *             estado es CONFIRMADA; en el resto de los estados es null.
   *           example: 12
   */
  router
    .route("/:usuarioId/compras")
    .get((req, res) => compraController.obtenerComprasDeUsuario(req, res));

export default router;