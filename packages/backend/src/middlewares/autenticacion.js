import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export function crearAutenticacion(authService) {
  const autenticar = (req, res, next) => {
    try {
      const authorization = req.get("authorization") ?? "";
      const coincidencia = authorization.match(/^Bearer\s+(.+)$/i);
      if (!coincidencia) throw new UnauthorizedError();
      req.usuario = authService.verificarToken(coincidencia[1]);
      return next();
    } catch (error) {
      return next(error);
    }
  };

  const requerirRol = (...roles) => (req, res, next) => {
    if (!req.usuario) return next(new UnauthorizedError());
    if (!roles.includes(req.usuario.rol)) return next(new ForbiddenError());
    return next();
  };

  return { autenticar, requerirRol };
}
