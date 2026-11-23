import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { Evento, TipoEntrada } from "../models/index.js";
import { normalizar } from "../utils/texto.js";
import { EstadoCompra } from "../models/EstadoCompra.js";

export class EventoService {
  constructor({ eventoRepository, categoriaRepository, compraRepository = null }) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
    this.compraRepository = compraRepository;
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
      lugar: datos.lugar.trim(),
      direccion: datos.direccion.trim(),
      multimedia: datos.multimedia ?? [],
      organizador: {
        id: datos.organizadorId,
        nombre: datos.organizadorNombre ?? "",
        apellido: datos.organizadorApellido ?? "",
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

    const eventosDisponibles = await this.eventoRepository.obtenerTodas();
    const compras = this.compraRepository?.obtenerTodas() ?? [];
    const eventos = eventosDisponibles
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
      .map((evento) => this.#serializar(
        evento,
        this.#calcularPuntajeOrganizador(evento.organizador.id, eventosDisponibles),
        compras,
        eventosDisponibles,
      ));

    return this.#ordenarEventos(eventos, ordenarPor, orden);
  }

  async obtenerResenias(eventoId) {
    const evento = await this.eventoRepository.obtenerPorId(eventoId);
    if (!evento) {
      throw new NotFoundError(`Evento no encontrado: ${eventoId}`);
    }
    return evento.resenias.map((resenia) => ({
      usuarioId: resenia.comprador?.id ?? null,
      nombre: resenia.comprador?.nombre ?? null,
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

  #serializar(evento, puntajeOrganizador, compras = [], todosEventos = [evento]) {
    const precios = evento.tiposEntrada.map((t) => t.precio);
    const cantidadReseniasOrganizador = todosEventos
      .filter((otroEvento) => otroEvento.organizador.id === evento.organizador.id)
      .reduce((total, otroEvento) => total + otroEvento.resenias.length, 0);
    return {
      id: evento.id,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      categoria: { id: evento.categoria.id, nombre: evento.categoria.nombre },
      fecha: evento.fecha,
      lugar: evento.lugar,
      direccion: evento.direccion,
      portada: evento.multimedia[0] ?? null,
      organizador: `${evento.organizador.nombre} ${evento.organizador.apellido}`,
      organizadorId: evento.organizador.id,
      cantidadReseniasOrganizador,
      precioDesde: precios.length > 0 ? Math.min(...precios) : null,
      tiposEntrada: evento.tiposEntrada.map((tipo) => {
        const comprasTipo = compras.filter((compra) => compra.evento === evento && compra.tipoEntrada === tipo);
        const comprasReservadas = comprasTipo.filter((compra) => ![EstadoCompra.CANCELADA, EstadoCompra.REEMBOLSADA].includes(compra.estado));
        const comprasVendidas = comprasTipo.filter((compra) => [EstadoCompra.CONFIRMADA, EstadoCompra.UTILIZADA].includes(compra.estado));
        const vendidas = comprasVendidas.reduce((total, compra) => total + compra.cantidad, 0);
        const reservadas = comprasReservadas.reduce((total, compra) => total + compra.cantidad, 0);
        return {
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          precio: tipo.precio,
          cupo: Math.max(0, tipo.cupoTotal - reservadas),
          cupoTotal: tipo.cupoTotal,
          vendidas,
          recaudado: comprasVendidas.reduce((total, compra) => total + compra.total, 0),
        };
      }),
      puntajeOrganizador,
      resenias: evento.resenias.map((resenia) => ({
        usuarioId: resenia.comprador?.id ?? null,
        puntuacion: resenia.puntuacion,
        detalle: resenia.detalle,
      })),
    };
  }

  #calcularPuntajeOrganizador(organizadorId, eventos) {
    const resenias = eventos
      .filter((evento) => evento.organizador.id === organizadorId)
      .flatMap((evento) => evento.resenias);
    if (resenias.length === 0) return null;
    const suma = resenias.reduce((total, resenia) => total + resenia.puntuacion, 0);
    return suma / resenias.length;
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
