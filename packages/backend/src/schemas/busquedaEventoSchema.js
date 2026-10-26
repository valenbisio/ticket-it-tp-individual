import { z } from "zod";

export const busquedaEventoSchema = z.object({
  q: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  ordenarPor: z.enum(["precio", "fecha", "puntajeOrganizador"]).optional(),
  orden: z.enum(["asc", "desc"]).optional().default("asc"),
});
