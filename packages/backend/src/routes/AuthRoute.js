import express from "express";
import { scryptSync } from "node:crypto";
import { AuthController } from "../controllers/AuthController.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { AuthService } from "../services/AuthService.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { crearAutenticacion } from "../middlewares/autenticacion.js";
import { registroSchema, loginSchema } from "../schemas/authSchema.js";

export const usuarioRepository = new UsuarioRepository();
const passwordHashDemo = `ticket-it-demo:${scryptSync("demo1234", "ticket-it-demo", 64).toString("hex")}`;
usuarioRepository.agregar({ id: "usuario-1", email: "comprador@ticketit.local", nombre: "Juan", apellido: "Pérez", rol: "comprador", passwordHash: passwordHashDemo });
usuarioRepository.agregar({ id: "usuario-2", email: "organizador@ticketit.local", nombre: "Sala Norte", apellido: "Producciones", rol: "organizador", passwordHash: passwordHashDemo });
export const authService = new AuthService({ usuarioRepository });
const authController = new AuthController({ authService });
export const { autenticar, requerirRol } = crearAutenticacion(authService);

const router = express.Router();
/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registrar una cuenta compradora u organizadora
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, nombre, apellido, rol]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               nombre: { type: string }
 *               apellido: { type: string }
 *               rol: { type: string, enum: [comprador, organizador] }
 *     responses:
 *       201: { description: Cuenta creada; devuelve token y usuario }
 *       409: { description: El email ya está registrado }
 */
router.post("/registro", validarSchema(registroSchema), authController.registrar);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Devuelve token JWT y usuario }
 *       401: { description: Credenciales incorrectas }
 */
router.post("/login", validarSchema(loginSchema), authController.login);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Recuperar el usuario asociado al token
 *     tags: [Autenticación]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Sesión válida }
 *       401: { description: Token ausente, inválido o vencido }
 */
router.get("/me", autenticar, authController.me);

export default router;
