import { randomBytes, scryptSync } from "node:crypto";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";

export const usuarioRepository = new UsuarioRepository();
const hashPasswordDemo = () => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync("demo1234", salt, 64).toString("hex")}`;
};

// Las cuatro cuentas de demostración usan la contraseña: demo1234.
const usuariosDemo = [
  { id: "usuario-1", email: "buyer@demo.local", nombre: "Juan", apellido: "Pérez", rol: "comprador" },
  { id: "usuario-2", email: "sala@demo.local", nombre: "Sala Norte", apellido: "Producciones", rol: "organizador" },
  { id: "usuario-3", email: "lucia@demo.local", nombre: "Lucía", apellido: "Gómez", rol: "comprador" },
  { id: "usuario-4", email: "martin@demo.local", nombre: "Martín", apellido: "Díaz", rol: "comprador" },
];

// Insert idempotently so reloading the seed module cannot duplicate demo accounts.
for (const usuario of usuariosDemo) {
  if (!usuarioRepository.obtenerPorId(usuario.id) && !usuarioRepository.obtenerPorEmail(usuario.email)) {
    usuarioRepository.agregar({ ...usuario, passwordHash: hashPasswordDemo() });
  }
}
