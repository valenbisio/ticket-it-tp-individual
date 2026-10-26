import crypto from "crypto";

export class Evento {
  constructor({
    nombre,
    descripcion,
    categoria, // Categoria
    fecha, // DateTime
    tiposEntrada = [], // TipoEntrada[]
    multimedia = [], // String[]
    organizador, // Usuario
    resenias = [], // Resenia[]
  }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = fecha ? new Date(fecha) : new Date();
    this.tiposEntrada = tiposEntrada;
    this.multimedia = multimedia;
    this.organizador = organizador;
    this.resenias = resenias;
  }

  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some(
      (tipo) => tipo.precio >= min && tipo.precio <= max
    );
  }

  agregarResenia(resenia) {
    this.resenias.push(resenia);
    return resenia;
  }
}
