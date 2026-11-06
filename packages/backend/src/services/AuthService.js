import { createHmac, randomBytes, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";
import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const DURACION_TOKEN_SEGUNDOS = 60 * 60 * 24;

export class AuthService {
  constructor({ usuarioRepository, secret = process.env.JWT_SECRET ?? "ticket-it-local-development-secret-change-me" }) {
    if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET es obligatorio en producción");
    }
    this.usuarioRepository = usuarioRepository;
    this.secret = secret;
  }

  registrar(datos) {
    if (this.usuarioRepository.obtenerPorEmail(datos.email)) {
      throw new ConflictError("Ya existe una cuenta con ese email");
    }
    const usuario = {
      id: randomUUID(),
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      rol: datos.rol,
      passwordHash: hashPassword(datos.password),
    };
    this.usuarioRepository.agregar(usuario);
    return this.#crearSesion(usuario);
  }

  login({ email, password }) {
    const usuario = this.usuarioRepository.obtenerPorEmail(email);
    if (!usuario || !verificarPassword(password, usuario.passwordHash)) {
      throw new UnauthorizedError("Email o contraseña incorrectos");
    }
    return this.#crearSesion(usuario);
  }

  obtenerSesion(usuarioId) {
    const usuario = this.usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) throw new UnauthorizedError("La sesión ya no es válida");
    return { usuario: usuarioPublico(usuario) };
  }

  verificarToken(token) {
    const [header, payload, firma] = token.split(".");
    if (!header || !payload || !firma) throw new UnauthorizedError("Token inválido");
    const firmaEsperada = this.#firmar(`${header}.${payload}`);
    const esperada = Buffer.from(firmaEsperada);
    const recibida = Buffer.from(firma);
    if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) {
      throw new UnauthorizedError("Token inválido");
    }
    let claims;
    try {
      claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
      throw new UnauthorizedError("Token inválido");
    }
    if (!claims || typeof claims.sub !== "string" || !["comprador", "organizador"].includes(claims.rol)
      || typeof claims.exp !== "number") throw new UnauthorizedError("Token inválido");
    if (claims.exp <= Math.floor(Date.now() / 1000)) throw new UnauthorizedError("Token vencido");
    const usuario = this.usuarioRepository.obtenerPorId(claims.sub);
    if (!usuario || usuario.rol !== claims.rol) throw new UnauthorizedError("Token inválido");
    return usuarioPublico(usuario);
  }

  #crearSesion(usuario) {
    const ahora = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      sub: usuario.id,
      rol: usuario.rol,
      iat: ahora,
      exp: ahora + DURACION_TOKEN_SEGUNDOS,
    })).toString("base64url");
    const token = `${header}.${payload}.${this.#firmar(`${header}.${payload}`)}`;
    return { token, usuario: usuarioPublico(usuario) };
  }

  #firmar(contenido) {
    return createHmac("sha256", this.secret).update(contenido).digest("base64url");
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verificarPassword(password, passwordHash) {
  const [salt, esperadoHex] = passwordHash.split(":");
  const esperado = Buffer.from(esperadoHex, "hex");
  const obtenido = scryptSync(password, salt, esperado.length);
  return esperado.length === obtenido.length && timingSafeEqual(esperado, obtenido);
}

function usuarioPublico({ id, email, nombre, apellido, rol }) {
  return { id, email, nombre, apellido, rol };
}
