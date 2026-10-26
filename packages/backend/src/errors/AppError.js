export class AppError extends Error {
    constructor(message) {
        super(message)
        this.status = 500
        this.timestamp = new Date().toISOString()
    }
}






