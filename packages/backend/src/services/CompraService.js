import { serializarCompras, serializarComprasDeEvento } from "../serializers/compras.js";
import { Mensaje } from "../models/Mensaje.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { Resenia } from "../models/Resenia.js";
import { Compra } from "../models/Compra.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

/**
 * Service de compras.
 *
 * Contiene la lógica de negocio y se comunica con el repositorio.
 * El controller delega en este service todo lo que no sea HTTP.
 */
export class CompraService {
  constructor({ compraRepository, eventoRepository, usuarioRepository, hoy, publicarMensaje = () => {} } = {}) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
    this.hoy = hoy;
    this.publicarMensaje = publicarMensaje;
  }

  async obtenerComprasDeUsuario(usuarioId) {
    const compras = await this.compraRepository.obtenerPorComprador(usuarioId);

    return {
      usuarioId,
      compras: serializarCompras(compras, this.hoy ?? new Date()),
    };
  }

  async obtenerComprasDeEvento(eventoId, organizadorId) {
    const evento = await (this.eventoRepository?.obtenerPorId(eventoId)
      ?? this.compraRepository.obtenerEventoPorId(eventoId));
    if (!evento) {
      throw new NotFoundError(`Evento no encontrado: ${eventoId}`);
    }
    if (organizadorId && evento.organizador?.id !== organizadorId) {
      throw new ForbiddenError("Solo el organizador del evento puede ver sus compras");
    }
    const compras = await this.compraRepository.obtenerPorEvento(eventoId);

    return serializarComprasDeEvento(evento, compras, this.hoy ?? new Date());
  }

  async obtenerCompra(compraId, usuarioId) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    }
    const esComprador = compra.comprador?.id === usuarioId;
    const esOrganizador = compra.evento?.organizador?.id === usuarioId;
    if (!esComprador && !esOrganizador) {
      throw new ForbiddenError("El usuario no participa de esta compra");
    }
    return compra;
  }

  async realizarCompra(eventoId, comprador, tipoEntradaNombre, cantidad) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);
    if (!evento) throw new NotFoundError(`Evento no encontrado: ${eventoId}`);

    const tipoEntrada = evento.tiposEntrada.find(
      (tipo) => tipo.nombre.toLowerCase() === tipoEntradaNombre.toLowerCase(),
    );
    if (!tipoEntrada) throw new NotFoundError(`Tipo de entrada no encontrado: ${tipoEntradaNombre}`);
    
    const comprasEvento = this.compraRepository.obtenerPorEvento(eventoId);
    tipoEntrada.reservar(cantidad, comprasEvento);
    const compradorDatos = typeof comprador === "string"
      ? (this.usuarioRepository?.obtenerPorId(comprador) ?? { id: comprador })
      : comprador;

    const compra = new Compra({
      comprador: compradorDatos,
      evento,
      tipoEntrada,
      cantidad,
    });
    return this.compraRepository.agregar(compra);
  }

  async enviarMensaje(compraId, usuarioId, texto) {
    const compra = this.compraRepository.obtenerPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    }
    const esComprador = compra.comprador?.id === usuarioId;
    const esOrganizador = compra.evento?.organizador?.id === usuarioId;
    if (!esComprador && !esOrganizador) {
      throw new ForbiddenError("El usuario no puede enviar mensajes en esta compra");
    }

    const mensaje = new Mensaje({
      usuario: esComprador ? compra.comprador : compra.evento.organizador,
      mensaje: texto,
    });
    compra.agregarMensaje(mensaje);
    this.publicarMensaje({ compra, mensaje, rol: esOrganizador ? "organizador" : "comprador" });
    return { mensaje, rol: esOrganizador ? "organizador" : "comprador" };
  }

  async obtenerMensajes(compraId, usuarioId) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    const esParticipante = compra.comprador?.id === usuarioId
      || compra.evento?.organizador?.id === usuarioId;
    if (!esParticipante) {
      throw new ForbiddenError("El usuario no puede consultar mensajes de esta compra");
    }
    compra.mensajesLeidosPor[usuarioId] = compra.mensajes.length;
    return compra.mensajes.map((mensaje) => ({
      id: mensaje.id,
      usuario: {
        id: mensaje.usuario?.id ?? null,
        nombre: mensaje.usuario?.nombre ?? null,
        apellido: mensaje.usuario?.apellido ?? null,
      },
      rol: mensaje.usuario?.id === compra.evento?.organizador?.id ? "organizador" : "comprador",
      mensaje: mensaje.mensaje,
      enviado: mensaje.enviado,
    }));
  }

  async obtenerConversaciones(usuarioId) {
    return this.compraRepository.obtenerTodas()
      .filter((compra) => compra.mensajes.length > 0
        && (compra.comprador?.id === usuarioId || compra.evento?.organizador?.id === usuarioId))
      .map((compra) => {
        const esComprador = compra.comprador?.id === usuarioId;
        const ultimoMensaje = compra.mensajes.at(-1);
        const leidos = compra.mensajesLeidosPor[usuarioId] ?? 0;
        const mensajesNoLeidos = compra.mensajes
          .slice(leidos)
          .filter((mensaje) => mensaje.usuario?.id !== usuarioId).length;
        const participante = esComprador ? compra.evento?.organizador : compra.comprador;
        return {
          compraId: compra.id,
          eventoId: compra.evento?.id ?? null,
          eventoNombre: compra.evento?.nombre ?? "Evento",
          eventoFecha: compra.evento?.fecha ?? null,
          participante: {
            id: participante?.id ?? null,
            nombre: [participante?.nombre, participante?.apellido].filter(Boolean).join(" "),
            rol: esComprador ? "organizador" : "comprador",
          },
          ultimoMensaje: ultimoMensaje.mensaje,
          ultimoMensajeEnviado: ultimoMensaje.enviado,
          mensajesNoLeidos,
        };
      })
      .sort((a, b) => new Date(b.ultimoMensajeEnviado) - new Date(a.ultimoMensajeEnviado));
  }

  async cancelarCompra(compraId, usuarioId) {
    const compra = this.compraRepository.obtenerPorId(compraId);
    if (!compra) {
      throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    }
    if (compra.comprador?.id !== usuarioId) {
      throw new ConflictError("Solo el comprador puede cancelar esta compra");
    }
    compra.cancelar({ hoy: this.hoy ?? new Date() });
    return compra;
  }

  async confirmarPago(compraId, organizadorId) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    if (compra.evento?.organizador?.id !== organizadorId) {
      throw new ForbiddenError("Solo el organizador del evento puede confirmar el pago");
    }
    compra.confirmarPago();
    return compra;
  }

  async marcarComoUtilizada(compraId, organizadorId) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    if (compra.evento?.organizador?.id !== organizadorId) {
      throw new ForbiddenError("Solo el organizador del evento puede validar la entrada");
    }
    compra.marcarComoUtilizada();
    return compra;
  }

  async calificarEvento(compraId, usuarioId, puntuacion, detalle) {
    const compra = await this.compraRepository.obtenerPorId(compraId);
    if (!compra) throw new NotFoundError(`Compra no encontrada: ${compraId}`);
    compra.validarPuedeCalificarse(usuarioId);
    const resenia = new Resenia({
      comprador: compra.comprador,
      evento: compra.evento,
      puntuacion,
      detalle,
    });
    compra.evento.agregarResenia(resenia);
    return resenia;
  }
}
