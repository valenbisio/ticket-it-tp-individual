import { AppError } from './AppError.js';

export class BadRequestError extends AppError {
    constructor(message) {
        super(message)
        this.status = 400
    }
}
