import crypto from "crypto";
export class Categoria {
  constructor({ nombre, descripcion }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}
