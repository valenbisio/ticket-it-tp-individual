export class TipoEntrada {
  constructor({ nombre, descripcion, precio, cupo }) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupo = cupo;
  }

  hayCupoPara(cantidad) {
    return this.cupo >= cantidad;
  }

  reducirCupo(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new Error("No hay suficiente cupo para este tipo de entrada");
    }
    this.cupo -= cantidad;
  }

  aumentarCupo(cantidad) {
    this.cupo += cantidad;
  }
}
