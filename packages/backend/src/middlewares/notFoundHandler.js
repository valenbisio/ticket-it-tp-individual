import { NotFoundError } from "../errors/NotFoundError.js";


// 1. Manejador para rutas no encontradas (404)
export function notFoundHandler(req, res, next) {
    next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
}
