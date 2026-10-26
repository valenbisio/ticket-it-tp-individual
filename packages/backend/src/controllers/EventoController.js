import { notFoundHandler } from "../middlewares/notFoundHandler.js";

export class EventoController {
  constructor({ eventoService }) {
    this.eventoService = eventoService;
  }

  buscarEventos(req, res, next) {
    const { q, categoria } = req.query;

    try {
      const eventos = this.eventoService.buscarEventos({
        texto: q,
        categoria,
      });

      return res.json({total: eventos.length,eventos,});
    } catch (error) {
      next(error);
    }
  }

  obtenerCategorias(req, res, next) {
    try {
      return res.json({
        categorias: this.eventoService.obtenerCategorias(),
      });
    } catch (error) {
      next(error);
    }
  }
}