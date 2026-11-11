import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { EventoController } from "../controllers/EventoController.js";

import { CompraService } from "../services/CompraService.js";
import { EventoService } from "../services/EventoService.js";

import { compraRepository, eventoRepository, categoriaRepository } from "../data/seed.js";
import { validarQuerySchema, validarSchema } from "../middlewares/validarSchema.js";
import { crearEventoSchema } from "../schemas/eventoSchema.js";
import { crearCompraSchema } from "../schemas/compraSchema.js";
import { busquedaEventoSchema } from "../schemas/busquedaEventoSchema.js";
import { autenticar, requerirRol } from "./AuthRoute.js";

const compraService = new CompraService({ compraRepository, eventoRepository });
const compraController = new CompraController({ compraService });
const eventoService = new EventoService({ eventoRepository, categoriaRepository });
const eventoController = new EventoController({ eventoService });

const router = express.Router();

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Buscar eventos por texto o categoría (Comprador)
 *     security: [{ bearerAuth: [] }]
 *     description: >
 *       Devuelve los eventos que coinciden con la búsqueda textual (nombre,
 *       descripción, categoría u organizador, sin distinguir mayúsculas ni
 *       tildes) y/o pertenecen a la categoría indicada. Sin parámetros
 *       devuelve todos los eventos.
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Texto a buscar
 *         example: rock
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: ID de la categoría (ver /api/eventos/categorias)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [precio, fecha, puntajeOrganizador]
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Eventos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 eventos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventoResumen'
 *       400:
 *         description: La categoría indicada no existe
 */
// Flujos 3 y 11: búsqueda, exploración y ordenamiento de eventos para compradores.
router.route("/").get(autenticar, requerirRol("comprador", "organizador"), validarQuerySchema(busquedaEventoSchema), (req, res, next) => eventoController.buscarEventos(req, res, next));

/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Crear un evento con sus tipos de entrada (Organizador)
 *     security: [{ bearerAuth: [] }]
 *     description: Crea un evento y sus tipos de entrada en una sola operación.
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion, categoriaId, fecha, tiposEntrada]
 *             properties:
 *               nombre: { type: string, example: Festival de Primavera }
 *               descripcion: { type: string, example: Música en vivo al aire libre }
 *               categoriaId: { type: string, description: ID de /api/eventos/categorias }
 *               fecha: { type: string, format: date-time, example: '2027-03-12T20:00:00.000Z' }
 *               multimedia: { type: array, items: { type: string } }
 *               tiposEntrada:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [nombre, precio, cupo]
 *                   properties:
 *                     nombre: { type: string, example: General }
 *                     descripcion: { type: string, example: Acceso general }
 *                     precio: { type: number, minimum: 0, example: 15000 }
 *                     cupo: { type: integer, minimum: 1, example: 200 }
 *     responses:
 *       201: { description: Evento creado }
 *       400: { description: Datos inválidos o categoría inexistente }
 */
// Flujo 4: creación de eventos por organizadores.
router.route("/").post(autenticar, requerirRol("organizador"), validarSchema(crearEventoSchema), (req, res, next) => {
  return eventoController.crearEvento(req, res, next);
});

/**
 * @swagger
 * /api/eventos/categorias:
 *   get:
 *     summary: Listar las categorías de eventos (Comprador)
 *     security: [{ bearerAuth: [] }]
 *     description: Sirve para explorar los eventos por categoría.
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             example:
 *               categorias:
 *                 - id: 550e8400-e29b-41d4-a716-446655440000
 *                   nombre: Recital
 *                   descripcion: Shows de música en vivo
 *                 - id: 550e8400-e29b-41d4-a716-446655440001
 *                   nombre: Teatro
 *                   descripcion: Obras y espectáculos teatrales
 */
router
  .route("/categorias")
  // Flujo 3: exploración del catálogo por categorías.
  .get(autenticar, requerirRol("comprador", "organizador"), (req, res, next) => eventoController.obtenerCategorias(req, res, next));

/**
 * @swagger
 * /api/eventos/{eventoId}/compras:
 *   get:
 *     summary: Obtener compras asociadas a un evento (Organizador)
 *     security: [{ bearerAuth: [] }]
 *     description: >
 *       Devuelve las compras asociadas a un evento en particular, diferenciando
 *       el estado de cada compra y mostrando cuántas entradas quedan disponibles
 *       de cada tipo.
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Detalle del evento, cupos y compras asociadas
 *       404:
 *         description: Evento no encontrado
 *   post:
 *     summary: Comprar entradas para un evento (Comprador)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipoEntrada, cantidad]
 *             properties:
 *               tipoEntrada: { type: string, example: General }
 *               cantidad: { type: integer, minimum: 1, example: 2 }
 *     responses:
 *       201: { description: Compra creada }
 *       409: { description: Cupo insuficiente }
 */
router
  .route("/:eventoId/compras")
  // Flujo 2 (GET): organizador consulta compras y disponibilidad.
  .get(autenticar, requerirRol("organizador"), (req, res, next) => compraController.obtenerComprasDeEvento(req, res, next))
  // Flujo 12 (POST): comprador compra tipo y cantidad de entradas.
  .post(autenticar, requerirRol("comprador"), validarSchema(crearCompraSchema), (req, res, next) => {
    return compraController.realizarCompra(req, res, next);
  });

/**
 * @swagger
 * /api/eventos/{eventoId}/resenias:
 *   get:
 *     summary: Obtener reseñas de un evento
 *     security: [{ bearerAuth: [] }]
 *     description: Devuelve las experiencias de compradores que utilizaron sus entradas.
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reseñas del evento }
 *       404: { description: Evento no encontrado }
 */
router
  .route("/:eventoId/resenias")
  // Flujo 10: comprador consulta reseñas antes de comprar.
  .get(autenticar, requerirRol("comprador"), (req, res, next) => eventoController.obtenerResenias(req, res, next));

export default router;
