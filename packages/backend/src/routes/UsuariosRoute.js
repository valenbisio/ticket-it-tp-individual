import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { compraRepository } from "../data/seed.js";
import { CompraService } from "../services/CompraService.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { enviarMensajeSchema } from "../schemas/mensajeSchema.js";
import { crearReseniaSchema } from "../schemas/reseniaSchema.js";
import { autenticar, requerirRol } from "./AuthRoute.js";

const compraService = new CompraService({ compraRepository });
const compraController = new CompraController({ compraService });

const router = express.Router();

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras:
 *   get:
 *     summary: Obtener compras de un comprador
 *     security: [{ bearerAuth: [] }]
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
 *         description: Se conserva por compatibilidad; la identidad efectiva sale del Bearer token.
 *     responses:
 *       200:
 *         description: Lista de compras del comprador identificado por el Bearer token
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
// Flujo 1: el comprador consulta todas sus compras y los días hasta el evento.
router
    .route("/:usuarioId/compras")
    .get(autenticar, requerirRol("comprador"), (req, res, next) => compraController.obtenerComprasDeUsuario(req, res, next),
);

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}/mensajes:
 *   get:
 *     summary: Leer el chat de una compra
 *     security: [{ bearerAuth: [] }]
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
 *     responses:
 *       200: { description: Historial de mensajes }
 *       403: { description: El usuario no participa de la compra }
 *       404: { description: Compra no encontrada }
 */
/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}/mensajes:
 *   post:
 *     summary: Enviar un mensaje relacionado con una compra (comprador u organizador)
 *     security: [{ bearerAuth: [] }]
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
// Flujos 5 y 6: comprador y organizador leen y envían mensajes en el chat de la compra.
router
  .route("/:usuarioId/compras/:compraId/mensajes")
  .get(autenticar, requerirRol("comprador", "organizador"), (req, res, next) => compraController.obtenerMensajes(req, res, next))
  .post(autenticar, requerirRol("comprador", "organizador"), validarSchema(enviarMensajeSchema), (req, res, next) => {
    return compraController.enviarMensaje(req, res, next);
  });

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}:
 *   patch:
 *     summary: Cancelar una compra antes de la realización del evento
 *     security: [{ bearerAuth: [] }]
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
// Flujos 7 y 8: cancelación por comprador sujeta a estado y fecha del evento.
router
  .route("/:usuarioId/compras/:compraId")
  .patch(autenticar, requerirRol("comprador"), (req, res, next) => compraController.cancelarCompra(req, res, next));

/**
 * @swagger
 * /api/usuarios/{usuarioId}/compras/{compraId}/resenias:
 *   post:
 *     summary: Calificar un evento luego de utilizar la entrada
 *     security: [{ bearerAuth: [] }]
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
// Flujo 9: el comprador califica después de utilizar una entrada.
router
  .route("/:usuarioId/compras/:compraId/resenias")
  .post(autenticar, requerirRol("comprador"), validarSchema(crearReseniaSchema), (req, res, next) => compraController.calificarEvento(req, res, next));

export default router;
