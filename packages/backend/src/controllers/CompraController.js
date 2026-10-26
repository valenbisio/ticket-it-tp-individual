import { CompraService } from "../services/CompraService.js";


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
}

