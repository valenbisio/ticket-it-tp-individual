import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "No tenés permisos para realizar esta operación") {
    super(message);
    this.status = 403;
  }
}
