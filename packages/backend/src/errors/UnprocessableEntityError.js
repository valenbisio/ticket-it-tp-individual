export class UnprocessableEntityError extends AppError {
    constructor(message) {
        super(message)
        this.status = 422
    }
}
