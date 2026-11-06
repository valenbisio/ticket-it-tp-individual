export class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  registrar = (req, res, next) => {
    try {
      return res.status(201).json(this.authService.registrar(req.body));
    } catch (error) {
      return next(error);
    }
  };

  login = (req, res, next) => {
    try {
      return res.status(200).json(this.authService.login(req.body));
    } catch (error) {
      return next(error);
    }
  };

  me = (req, res, next) => {
    try {
      return res.status(200).json(this.authService.obtenerSesion(req.usuario.id));
    } catch (error) {
      return next(error);
    }
  };
}
