export class Mensaje {
  constructor({ usuario, mensaje, enviado = new Date() }) {
    this.usuario = usuario; 
    this.mensaje = mensaje; 
    this.enviado = enviado;
  }
}
