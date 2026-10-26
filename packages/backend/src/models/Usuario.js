import crypto from "crypto";

export class Usuario {
  constructor({ nombre, apellido, favoritos = [] }) {
    this.id = crypto.randomUUID();
    this.nombre = nombre;
    this.apellido = apellido;
    this.favoritos = favoritos; // Evento[]
  }

  agregarFavorito(evento) {
    if (!this.favoritos.includes(evento)) {
      this.favoritos.push(evento);
    }
  }

  removerFavorito(evento) {
    this.favoritos = this.favoritos.filter(e => e !== evento);
  }
}
