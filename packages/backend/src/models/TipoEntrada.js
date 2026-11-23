import { ReglaDeNegocioError } from "../errors/ReglaDeNegocioError.js";
import { EstadoCompra } from "./EstadoCompra.js";

export class TipoEntrada {
  #cupo;

  constructor({ nombre, descripcion, precio, cupo }) {
    if (typeof nombre !== "string" || !nombre.trim()) {
      throw new ReglaDeNegocioError("El nombre del tipo de entrada es obligatorio");
    }
    if (!Number.isFinite(precio) || precio < 0) {
      throw new ReglaDeNegocioError("El precio de la entrada debe ser un número no negativo");
    }
    if (!Number.isInteger(cupo) || cupo <= 0) {
      throw new ReglaDeNegocioError("El cupo debe ser un entero positivo");
    }
    this.nombre = nombre.trim();
    this.descripcion = descripcion;
    this.precio = precio;
    this.#cupo = cupo;
    this.cupoTotal = cupo;
  }

  get cupo() {
    return this.#cupo;
  }

  hayCupoPara(cantidad) {
    return Number.isInteger(cantidad) && cantidad > 0 && this.#cupo >= cantidad;
  }

  reservar(cantidad, comprasExistentes = []) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new ReglaDeNegocioError("La cantidad de entradas debe ser un entero positivo");
    }
    const cantidadReservada = comprasExistentes
      .filter((compra) => compra.tipoEntrada === this
        && compra.estado !== EstadoCompra.CANCELADA
        && compra.estado !== EstadoCompra.REEMBOLSADA)
      .reduce((total, compra) => total + compra.cantidad, 0);
    const disponible = Math.max(0, Math.min(this.#cupo, this.cupoTotal - cantidadReservada));
    if (disponible < cantidad) {
      throw new ReglaDeNegocioError("No hay suficiente cupo para este tipo de entrada");
    }
    this.#cupo -= cantidad;
  }

  liberar(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0 || this.#cupo + cantidad > this.cupoTotal) {
      throw new ReglaDeNegocioError("No se puede liberar esa cantidad de cupo");
    }
    this.#cupo += cantidad;
  }
}
