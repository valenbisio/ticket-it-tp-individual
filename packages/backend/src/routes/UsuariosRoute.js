import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { compraRepository } from "../data/seed.js";
import { CompraService } from "../services/CompraService.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { enviarMensajeSchema } from "../schemas/mensajeSchema.js";
import { crearReseniaSchema } from "../schemas/reseniaSchema.js";

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
    .get( (req, res, next) => compraController.obtenerComprasDeUsuario(req, res),
);

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}/mensajes:
 *   post:
 *     summary: Enviar un mensaje relacionado con una compra (comprador u organizador)
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: compraId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mensaje]
 *             properties:
 *               mensaje: { type: string, example: ¿A qué hora comienza el evento? }
 *     responses:
 *       201: { description: Mensaje enviado }
 *       404: { description: Compra no encontrada }
 *       409: { description: El usuario no es el comprador ni el organizador de la compra }
 */
router
  .route("/:usuarioId/compras/:compraId/mensajes")
  .post(validarSchema(enviarMensajeSchema), (req, res, next) => compraController.enviarMensaje(req, res, next));

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}:
 *   patch:
 *     summary: Cancelar una compra antes de la realización del evento
 *     description: Cambia el estado de la compra a CANCELADA y conserva su trazabilidad.
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: string }
 *         description: ID del comprador
 *       - in: path
 *         name: compraId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Compra cancelada }
 *       404: { description: Compra no encontrada }
 *       409: { description: La compra no puede cancelarse }
 */
router
  .route("/:usuarioId/compras/:compraId")
  .patch((req, res, next) => compraController.cancelarCompra(req, res, next));

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}/resenias:
 *   post:
 *     summary: Calificar un evento luego de utilizar la entrada
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: compraId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [puntuacion, detalle]
 *             properties:
 *               puntuacion: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               detalle: { type: string, example: Excelente evento }
 *     responses:
 *       201: { description: Reseña creada }
 *       404: { description: Compra no encontrada }
 *       409: { description: La entrada aún no fue utilizada }
 */
router
  .route("/:usuarioId/compras/:compraId/resenias")
  .post(validarSchema(crearReseniaSchema), (req, res, next) => compraController.calificarEvento(req, res, next));

export default router;
