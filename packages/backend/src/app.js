import cors from "cors";
import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { CompraController } from "./controllers/CompraController.js";
import { compraRepository as compraRepositoryPorDefecto } from "./data/seed.js";
import { crearComprasRouter } from "./routes/ComprasRoute.js";
import { CompraService } from "./services/CompraService.js";
import { swaggerSpec } from "./swagger.js";

/**
 * Crea la aplicación Express.
 *
 * Recibe el repositorio de compras y una fecha de referencia inyectables para
 * poder testear la API sin depender del estado global ni del reloj del sistema.
 */
export function crearApp({ compraRepository = compraRepositoryPorDefecto, hoy } = {}) {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : true,
    }),
  );

  // ── Swagger ─────────────────────────────────────────────
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/hello", (req, res) => {
    res.json({ message: "hello world" });
  });

  // ── API ─────────────────────────────────────────────────
  const compraService = new CompraService({ compraRepository, hoy });
  const compraController = new CompraController({ compraService });

  const apiRouter = Router();
  apiRouter.use("/usuarios", crearComprasRouter(compraController));

  app.use("/api", apiRouter);

  return app;
}
