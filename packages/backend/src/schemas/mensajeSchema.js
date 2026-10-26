import { z } from "zod";

export const enviarMensajeSchema = z.object({
  mensaje: z.string().trim().min(1, "El mensaje no puede estar vacío"),
});
