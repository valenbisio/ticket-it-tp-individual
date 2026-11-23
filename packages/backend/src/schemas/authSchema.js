import { z } from "zod";

const credenciales = {
  email: z.string().trim().email("El email no es válido").transform((email) => email.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/\d/, "La contraseña debe incluir al menos un número"),
};
const nombrePersona = (etiqueta) => z.string().trim()
  .min(1, `${etiqueta} es obligatorio`)
  .regex(/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u, `${etiqueta} debe contener solo letras`);

export const registroSchema = z.object({
  ...credenciales,
  nombre: nombrePersona("El nombre"),
  apellido: nombrePersona("El apellido"),
  rol: z.enum(["comprador", "organizador"]),
  avatar: z.string().regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/).max(6_000_000).optional(),
});

export const loginSchema = z.object(credenciales);

export const actualizarPerfilSchema = z.object({
  email: credenciales.email,
  nombre: nombrePersona("El nombre"),
  apellido: nombrePersona("El apellido"),
  avatar: z.string().regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/).max(6_000_000).nullable().optional(),
});
