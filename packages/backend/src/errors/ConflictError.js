import { AppError } from "./AppError.js"

export class ConflictError extends AppError {
    constructor(message) {
        super(message)
        this.status = 409
    }
}
