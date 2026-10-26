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

  crearEvento(req, res, next) {
    try {
      const evento = this.eventoService.crearEvento(req.body);
      return res.status(201).json({ evento: serializarEventoCreado(evento) });
    } catch (error) {
      next(error);
    }
  }
}

function serializarEventoCreado(evento) {
  return {
    id: evento.id,
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    categoria: { id: evento.categoria.id, nombre: evento.categoria.nombre },
    fecha: evento.fecha,
    multimedia: evento.multimedia,
    organizadorId: evento.organizador.id,
    tiposEntrada: evento.tiposEntrada.map(({ nombre, descripcion, precio, cupo }) => ({
      nombre, descripcion, precio, cupo,
    })),
  };
}
