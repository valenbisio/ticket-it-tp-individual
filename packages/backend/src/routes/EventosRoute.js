import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { EventoController } from "../controllers/EventoController.js";

import { CompraService } from "../services/CompraService.js";
import { EventoService } from "../services/EventoService.js";

import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { crearEventoSchema } from "../schemas/eventoSchema.js";

const compraRepository = new CompraRepository();
const compraService = new CompraService({ compraRepository });
const compraController = new CompraController({ compraService });

const eventoRepository = new EventoRepository();
const categoriaRepository = new CategoriaRepository();
const eventoService = new EventoService({ eventoRepository, categoriaRepository });
const eventoController = new EventoController({ eventoService });

const router = express.Router();

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Buscar eventos por texto o categoría (Comprador)
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
 *         example: recital
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
router.route("/").get((req, res, next) => eventoController.buscarEventos(req, res));

/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Crear un evento con sus tipos de entrada (Organizador)
 *     description: Crea un evento y sus tipos de entrada en una sola operación.
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion, categoriaId, fecha, organizadorId, tiposEntrada]
 *             properties:
 *               nombre: { type: string, example: Festival de Primavera }
 *               descripcion: { type: string, example: Música en vivo al aire libre }
 *               categoriaId: { type: string, description: ID de /api/eventos/categorias }
 *               fecha: { type: string, format: date-time, example: '2027-03-12T20:00:00.000Z' }
 *               organizadorId: { type: string, example: usuario-2 }
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
router.route("/").post(validarSchema(crearEventoSchema), (req, res, next) => eventoController.crearEvento(req, res, next));

/**
 * @swagger
 * /api/eventos/categorias:
 *   get:
 *     summary: Listar las categorías de eventos (Comprador)
 *     description: Sirve para explorar los eventos por categoría.
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             example:
 *               categorias:
 *                 - id: recital
 *                   nombre: Recital
 *                   descripcion: Shows de música en vivo
 *                 - id: teatro
 *                   nombre: Teatro
 *                   descripcion: Obras y espectáculos teatrales
 */
router
  .route("/categorias")
  .get((req, res, next) => eventoController.obtenerCategorias(req, res));

/**
 * @swagger
 * /api/eventos/{eventoId}/compras:
 *   get:
 *     summary: Obtener compras asociadas a un evento (Organizador)
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
 */
router
  .route("/:eventoId/compras")
  .get((req, res, next) => compraController.obtenerComprasDeEvento(req, res));

/**
 * @swagger
 * /api/eventos/{eventoId}/resenias:
 *   get:
 *     summary: Obtener reseñas de un evento
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
  .get((req, res, next) => eventoController.obtenerResenias(req, res, next));

export default router;
