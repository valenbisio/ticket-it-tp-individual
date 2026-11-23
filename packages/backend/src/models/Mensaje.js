import { randomUUID } from "node:crypto";

export class Mensaje {
  constructor({ id = randomUUID(), usuario, mensaje, enviado = new Date() }) {
    this.id = id;
    this.usuario = usuario; 
    this.mensaje = mensaje; 
    this.enviado = enviado;
  }
}
