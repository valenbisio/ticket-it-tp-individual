import { z } from "zod";

const credenciales = {
  email: z.string().trim().email("El email no es válido").transform((email) => email.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
};

export const registroSchema = z.object({
  ...credenciales,
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  rol: z.enum(["comprador", "organizador"]),
});

export const loginSchema = z.object(credenciales);
