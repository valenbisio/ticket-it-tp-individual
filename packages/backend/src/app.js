import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import usuarioRoutes from "./routes/UsuariosRoute.js";
import eventoRoutes from "./routes/EventosRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { swaggerSpec } from "./swagger.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  }),
);

// Documentación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
app.get("/", (req, res) => res.redirect("/api-docs"));

// API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/eventos", eventoRoutes);

//MIDDLEWARES
app.use(notFoundHandler)

app.use(errorLogger)

app.use(errorHandler) //SIEMPRE A LO ULTIMO

export default app;