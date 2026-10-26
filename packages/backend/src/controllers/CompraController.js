import { CompraService } from "../services/CompraService.js";
import { serializarCompra } from "../serializers/compras.js";


/**
 * Controller de compras.
 *
 * Solo se ocupa de lo que es HTTP: extraer parámetros del request,
 * llamar al service y armar la respuesta.
 */
export class CompraController {
  constructor({ compraService }) {
    this.compraService = compraService;
  }

  obtenerComprasDeUsuario(req, res, next) {
    try {
      const { usuarioId } = req.params;
      const resultado =
        this.compraService.obtenerComprasDeUsuario(usuarioId);

      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  obtenerComprasDeEvento(req, res, next) {
    try {
      const { eventoId } = req.params;
      const resultado =
        this.compraService.obtenerComprasDeEvento(eventoId);

      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  enviarMensaje(req, res, next) {
    try {
      const { usuarioId, compraId } = req.params;
      const { mensaje } = req.body;
      const resultado = this.compraService.enviarMensaje(compraId, usuarioId, mensaje);
      return res.status(201).json({
        mensaje: {
          usuarioId: resultado.usuario.id,
          mensaje: resultado.mensaje,
          enviado: resultado.enviado,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  cancelarCompra(req, res, next) {
    try {
      const compra = this.compraService.cancelarCompra(
        req.params.compraId,
        req.params.usuarioId,
      );
      return res.status(200).json({ compra: serializarCompra(compra) });
    } catch (error) {
      return next(error);
    }
  }

  calificarEvento(req, res, next) {
    try {
      const resenia = this.compraService.calificarEvento(
        req.params.compraId,
        req.params.usuarioId,
        req.body.puntuacion,
        req.body.detalle,
      );
      return res.status(201).json({
        resenia: {
          eventoId: resenia.evento.id,
          usuarioId: resenia.comprador.id,
          puntuacion: resenia.puntuacion,
          detalle: resenia.detalle,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

