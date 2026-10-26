import { z } from "zod";

const tipoEntradaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre del tipo de entrada es obligatorio"),
  descripcion: z.string().trim().optional().default(""),
  precio: z.number().finite().nonnegative("El precio no puede ser negativo"),
  cupo: z.number().int().positive("El cupo debe ser un entero positivo"),
});

export const crearEventoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  categoriaId: z.string().trim().min(1, "La categoría es obligatoria"),
  fecha: z.string().datetime({ offset: true }).refine(
    (fecha) => new Date(fecha) > new Date(),
    "La fecha debe ser futura",
  ),
  organizadorId: z.string().trim().min(1, "El organizador es obligatorio"),
  multimedia: z.array(z.string().url()).optional().default([]),
  tiposEntrada: z.array(tipoEntradaSchema).min(1, "Debe incluir al menos un tipo de entrada"),
});
