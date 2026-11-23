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
});

export const loginSchema = z.object(credenciales);

export const actualizarPerfilSchema = z.object({
  email: credenciales.email,
  nombre: nombrePersona("El nombre"),
  apellido: nombrePersona("El apellido"),
});
