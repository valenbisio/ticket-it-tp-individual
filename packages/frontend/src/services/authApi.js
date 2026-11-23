import { request, setToken, getCurrentUserId } from './apiClient.js';

export const authApi = {
 
  async login(email, password) {
    const session = await request('/auth/login', { method: 'POST', body: { email, password } });
    setToken(session.token, session.usuario.id);
    return session;
  },
  async register(datos) {
    const session = await request('/auth/registro', { method: 'POST', body: datos });
    setToken(session.token, session.usuario.id);
    return session;
  },
  async restoreSession(savedToken) {
    setToken(savedToken);
    const data = await request('/auth/me');
    setToken(savedToken, data.usuario.id);
    return { token: savedToken, usuario: data.usuario };
  },
  async updateProfile(datos) {
    const result = await request('/auth/perfil', { method: 'PATCH', body: datos });
    return result.usuario;
  },
  setToken,
  getCurrentUserId,
};
