import { AppError } from './AppError.js';
export class NotFoundError extends AppError {
    constructor(message) {
        super(message)
        this.status = 404
    }
}
