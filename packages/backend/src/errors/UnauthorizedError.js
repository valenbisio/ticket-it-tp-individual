import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Autenticación requerida") {
    super(message);
    this.status = 401;
  }
}
