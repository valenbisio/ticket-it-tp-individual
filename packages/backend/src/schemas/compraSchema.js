import { z } from "zod";

export const crearCompraSchema = z.object({
  tipoEntrada: z.string().trim().min(1, "El tipo de entrada es obligatorio"),
  cantidad: z.number().int().positive("La cantidad debe ser un entero positivo"),
});
