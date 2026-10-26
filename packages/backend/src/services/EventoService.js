import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { Evento, TipoEntrada } from "../models/index.js";

export class EventoService {
  constructor({ eventoRepository, categoriaRepository }) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
  }

  async obtenerCategorias() {
    const categorias = await this.categoriaRepository.obtenerTodas();
    return categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
    }));
  }

  async crearEvento(datos) {
    const categoria = this.#resolverCategoria(datos.categoriaId);
    const evento = new Evento({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      categoria,
      fecha: datos.fecha,
      multimedia: datos.multimedia ?? [],
      organizador: {
        id: datos.organizadorId,
        nombre: "",
        apellido: "",
      },
      tiposEntrada: datos.tiposEntrada.map((tipo) => new TipoEntrada({
        nombre: tipo.nombre.trim(),
        descripcion: tipo.descripcion?.trim() ?? "",
        precio: tipo.precio,
        cupo: tipo.cupo,
      })),
    });

    return await this.eventoRepository.agregar(evento);
  }

  async buscarEventos({ texto, categoria, ordenarPor, orden = "asc" } = {}) {
    const categoriaBuscada = this.#resolverCategoria(categoria);
    const palabras = texto ? normalizar(texto).split(/\s+/).filter(Boolean) : [];

    const eventos = (await this.eventoRepository.obtenerTodos())
      .filter((evento) => {
        if (categoriaBuscada && evento.categoria.id !== categoriaBuscada.id) {
          return false;
        }
        if (palabras.length === 0) return true;

        const contenido = normalizar(
          [
            evento.nombre,
            evento.descripcion,
            evento.categoria.nombre,
            evento.organizador.nombre,
            evento.organizador.apellido,
          ].join(" "),
        );
        // Todas las palabras buscadas deben aparecer
        return palabras.every((palabra) => contenido.includes(palabra));
      })
      .map((evento) => this.#serializar(evento));

    return this.#ordenarEventos(eventos, ordenarPor, orden);
  }

  async obtenerResenias(eventoId) {
    const evento = await this.eventoRepository.obtenerPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento no encontrado: ${eventoId}`);
    }
    return evento.resenias.map((resenia) => ({
      usuarioId: resenia.comprador?.id ?? null,
      puntuacion: resenia.puntuacion,
      detalle: resenia.detalle,
    }));
  }

  #resolverCategoria(id) {
    if (!id) return null;

    const categorias = this.categoriaRepository.obtenerTodas();
    const encontrada = categorias.find((c) => c.id === String(id).trim().toLowerCase());
    if (!encontrada) {
      throw new BadRequestError(`La categoría '${id}' no existe`);
    }
    return encontrada;
  }

  #serializar(evento) {
    const precios = evento.tiposEntrada.map((t) => t.precio);
    return {
      id: evento.id,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      categoria: { id: evento.categoria.id, nombre: evento.categoria.nombre },
      fecha: evento.fecha,
      portada: evento.multimedia[0] ?? null,
      organizador: `${evento.organizador.nombre} ${evento.organizador.apellido}`,
      precioDesde: precios.length > 0 ? Math.min(...precios) : null,
      puntajeOrganizador: this.#calcularPuntajeOrganizador(evento),
      resenias: evento.resenias.map((resenia) => ({
        usuarioId: resenia.comprador?.id ?? null,
        puntuacion: resenia.puntuacion,
        detalle: resenia.detalle,
      })),
    };
  }

  #calcularPuntajeOrganizador(evento) {
    if (evento.resenias.length === 0) return null;
    const suma = evento.resenias.reduce((total, resenia) => total + resenia.puntuacion, 0);
    return suma / evento.resenias.length;
  }

  #ordenarEventos(eventos, ordenarPor, orden = "asc") {
    if (!ordenarPor) return eventos;

    const campos = {
      precio: "precioDesde",
      fecha: "fecha",
      puntajeOrganizador: "puntajeOrganizador",
    };
    const campo = campos[ordenarPor];
    const factor = orden === "desc" ? -1 : 1;
    return eventos.sort((a, b) => {
      const valorA = campo === "fecha" ? new Date(a[campo]).getTime() : (a[campo] ?? 0);
      const valorB = campo === "fecha" ? new Date(b[campo]).getTime() : (b[campo] ?? 0);
      return (valorA - valorB) * factor;
    });
  }
}
