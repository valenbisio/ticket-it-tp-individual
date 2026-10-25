import { CompraService } from "../services/CompraService";

/**
 * Controller de compras.
 *
 * Solo se ocupa de lo que es HTTP: extraer parámetros del request,
 * llamar al service, y armar la respuesta.
 */
export class CompraController {
  constructor(compraService = new CompraService()) {
    this.compraService = compraService;
  }


  obtenerComprasDeUsuario(req, res) {
    const { usuarioId } = req.params;
    const resultado = this.compraService.obtenerComprasDeUsuario(usuarioId);

    res.json(resultado);
  }
}
