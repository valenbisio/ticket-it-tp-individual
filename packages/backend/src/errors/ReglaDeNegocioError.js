export class ReglaDeNegocioError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReglaDeNegocioError";
  }
}
