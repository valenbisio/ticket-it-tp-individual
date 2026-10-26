import express from "express";
import { CompraController } from "../controllers/CompraController.js";
import { compraRepository } from "../data/seed.js";
import { CompraService } from "../services/CompraService.js";

const compraService = new CompraService({ compraRepository });
const compraController = new CompraController({ compraService });

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
router.route("/").get((req, res) => eventoController.buscarEventos(req, res));

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
  .get((req, res) => eventoController.obtenerCategorias(req, res));

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
  .get((req, res) => compraController.obtenerComprasDeEvento(req, res));

export default router;