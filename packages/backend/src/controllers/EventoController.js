import { notFoundHandler } from "../middlewares/notFoundHandler.js";

export class EventoController {
  constructor({ eventoService }) {
    this.eventoService = eventoService;
  }

  async buscarEventos(req, res, next) {
    const { q, categoria, ordenarPor, orden } = req.query;

    try {
      const eventos = await this.eventoService.buscarEventos({
        texto: q,
        categoria,
        ordenarPor,
        orden,
      });

      return res.json({total: eventos.length,eventos,});
    } catch (error) {
      next(error);
    }
  }

  async obtenerCategorias(req, res, next) {
    try {
      return res.json({
        categorias: await this.eventoService.obtenerCategorias(),
      });
    } catch (error) {
      next(error);
    }
  }

  async crearEvento(req, res, next) {
    try {
      const evento = await this.eventoService.crearEvento(req.body);
      return res.status(201).json({ evento: serializarEventoCreado(evento) });
    } catch (error) {
      next(error);
    }
  }

  async obtenerResenias(req, res, next) {
    try {
      return res.status(200).json({
        eventoId: req.params.eventoId,
        resenias: await this.eventoService.obtenerResenias(req.params.eventoId),
      });
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
