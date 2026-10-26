import { CategoriaInexistenteError } from "../services/EventoService.js";

export class EventoController {
  constructor({ eventoService }) {
    this.eventoService = eventoService;
  }

  buscarEventos(req, res) {
    const { q, categoria } = req.query;

    try {
      const eventos = this.eventoService.buscarEventos({ texto: q, categoria });
      return res.json({ total: eventos.length, eventos });
    } catch (error) {
      if (error instanceof CategoriaInexistenteError) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  }

  obtenerCategorias(req, res) {
    return res.json({ categorias: this.eventoService.obtenerCategorias() });
  }
}