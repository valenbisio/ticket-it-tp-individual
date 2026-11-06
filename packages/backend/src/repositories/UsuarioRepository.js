export class UsuarioRepository {
  constructor() {
    this.usuarios = [];
  }

  agregar(usuario) {
    this.usuarios.push(usuario);
    return usuario;
  }

  obtenerPorEmail(email) {
    return this.usuarios.find((usuario) => usuario.email === email) ?? null;
  }

  obtenerPorId(id) {
    return this.usuarios.find((usuario) => usuario.id === id) ?? null;
  }
}
