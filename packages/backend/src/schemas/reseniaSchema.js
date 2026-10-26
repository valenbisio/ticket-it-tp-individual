import { z } from "zod";

export const crearReseniaSchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  detalle: z.string().trim().min(1, "El comentario es obligatorio"),
});
