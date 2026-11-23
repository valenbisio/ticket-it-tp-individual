import { z } from "zod";

export const crearReseniaSchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  detalle: z.string().trim().max(1000, "El comentario no puede superar los 1000 caracteres").optional(),
});
