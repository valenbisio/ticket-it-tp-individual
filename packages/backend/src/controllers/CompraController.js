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

  async obtenerComprasDeUsuario(req, res, next) {
    try {
      const usuarioId = req.usuario.id;
      const resultado =
        await this.compraService.obtenerComprasDeUsuario(usuarioId);

      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerComprasDeEvento(req, res, next) {
    try {
      const { eventoId } = req.params;
      const resultado =
        await this.compraService.obtenerComprasDeEvento(eventoId, req.usuario?.id);

      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async enviarMensaje(req, res, next) {
    try {
      const { compraId } = req.params;
      const { mensaje } = req.body;
      const resultado = await this.compraService.enviarMensaje(compraId, req.usuario.id, mensaje);
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

  async obtenerMensajes(req, res, next) {
    try {
      const mensajes = await this.compraService.obtenerMensajes(
        req.params.compraId,
        req.usuario.id,
      );
      return res.status(200).json({ compraId: req.params.compraId, mensajes });
    } catch (error) {
      return next(error);
    }
  }

  async cancelarCompra(req, res, next) {
    try {
      const compra = await this.compraService.cancelarCompra(
        req.params.compraId,
        req.usuario.id,
      );
      return res.status(200).json({ compra: serializarCompra(compra) });
    } catch (error) {
      return next(error);
    }
  }

  async marcarComoUtilizada(req, res, next) {
    try {
      const compra = await this.compraService.marcarComoUtilizada(req.params.compraId, req.usuario.id);
      return res.status(200).json({ compra: serializarCompra(compra) });
    } catch (error) {
      return next(error);
    }
  }

  async calificarEvento(req, res, next) {
    try {
      const resenia = await this.compraService.calificarEvento(
        req.params.compraId,
        req.usuario.id,
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

  async realizarCompra(req, res, next) {
    try {
      const compra = await this.compraService.realizarCompra(
        req.params.eventoId,
        req.usuario.id,
        req.body.tipoEntrada,
        req.body.cantidad,
      );
      return res.status(201).json({ compra: serializarCompra(compra) });
    } catch (error) {
      return next(error);
    }
  }
}

