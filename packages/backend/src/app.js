import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import usuarioRoutes from "./routes/UsuarioRoutes.js";
import eventoRoutes from "./routes/EventoRoutes.js";
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

export default app;