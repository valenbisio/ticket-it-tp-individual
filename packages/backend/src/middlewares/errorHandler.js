import { AppError } from "../errors/AppError.js";



export function errorHandler(err, req , res, next){
    if (res.headersSent) {
        return next(err);
    }
    
    if (err.name === "CastError") { // cuando posteas un con un id incorrecto ponele en vez de 12345 pones 1234 deberia tirar 400, si pones 22345 ahi si que tira bien 404
  return res.status(400).json({
    status: "error",
    message: `Id inválido: ${err.value}`,
    timestamp: new Date().toISOString(),
        });
    }

    if (err instanceof AppError) {
        const statusCode = err.statusCode || err.status || 500;
        return res.status(statusCode).json({
            status: err.status && typeof err.status === "string" ? err.status : (statusCode >= 500 ? "error" : "fail"),
            statusCode: statusCode,
            message: err.message,
            timestamp: err.timestamp || new Date().toISOString(),
        });
    }

    // Errores no controlados (500)
    return res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        timestamp: new Date().toISOString(),
    });
}