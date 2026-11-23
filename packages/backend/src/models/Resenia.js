import { ReglaDeNegocioError } from "../errors/ReglaDeNegocioError.js";

export class Resenia {
  #puntuacion;

  constructor({
    comprador, // Usuario
    evento, // Evento
    detalle, 
    puntuacion,
  }) {
    const detalleNormalizado = typeof detalle === "string" ? detalle.trim() : detalle;
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new ReglaDeNegocioError("La puntuación debe ser un entero entre 1 y 5");
    }
    if (detalle !== undefined && (typeof detalle !== "string" || detalleNormalizado.length > 1000)) {
      throw new ReglaDeNegocioError("El comentario no puede superar los 1000 caracteres");
    }
    this.comprador = comprador;
    this.evento = evento;
    this.detalle = detalleNormalizado;
    this.#puntuacion = puntuacion;
  }

  get puntuacion() {
    return this.#puntuacion;
  }
}
