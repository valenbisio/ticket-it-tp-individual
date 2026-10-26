import rateLimit from "express-rate-limit";

export const responderLimiteExcedido = (req, res) => {
  res.status(429).json({
    status: "fail",
    statusCode: 429,
    message: "Demasiadas solicitudes, intente de nuevo más tarde.",
    timestamp: new Date().toISOString(),
  });
};

export const crearLimite = ({ windowMs, limit }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: responderLimiteExcedido,
  });

export const limiteGeneral = crearLimite({
  windowMs: 15 * 60 * 1000, //15 minutos
  limit: 5,               //máx 100 solicitudes por IP en la ventana
});