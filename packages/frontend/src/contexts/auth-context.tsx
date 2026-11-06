import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { ApiUrl } from '@/constants/api';

export type Rol = 'comprador' | 'organizador';
export type UsuarioSesion = { id: string; email: string; nombre: string; apellido: string; rol: Rol };
type Sesion = { token: string; usuario: UsuarioSesion };
type Registro = Omit<UsuarioSesion, 'id' | 'email'> & { email: string; password: string };

type AuthContextValue = {
  estado: 'cargando' | Sesion | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrar: (datos: Registro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let limpiarSesionActiva: (() => Promise<void>) | null = null;
let tokenEnMemoria: string | null = null;

export function AuthProvider({ children }: PropsWithChildren) {
  const [estado, setEstado] = useState<'cargando' | Sesion | null>('cargando');

  useEffect(() => {
    void (async () => {
      try {
        const token = tokenEnMemoria;
        if (!token) return setEstado(null);
        const response = await fetch(`${ApiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) {
          tokenEnMemoria = null;
          return setEstado(null);
        }
        const data = (await response.json()) as { usuario: UsuarioSesion };
        setEstado({ token, usuario: data.usuario });
      } catch {
        setEstado(null);
      }
    })();
  }, []);

  const guardarSesion = useCallback(async (response: Response) => {
    const data = (await response.json()) as Sesion | { message?: string };
    if (!response.ok || !('token' in data)) {
      throw new Error('message' in data ? data.message ?? 'No se pudo iniciar sesión' : 'No se pudo iniciar sesión');
    }
    tokenEnMemoria = data.token;
    setEstado(data);
  }, []);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${ApiUrl}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    });
    await guardarSesion(response);
  }, [guardarSesion]);

  const registrar = useCallback(async (datos: Registro) => {
    const response = await fetch(`${ApiUrl}/auth/registro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos),
    });
    await guardarSesion(response);
  }, [guardarSesion]);

  const cerrarSesion = useCallback(async () => {
    tokenEnMemoria = null;
    setEstado(null);
  }, []);

  useEffect(() => { limpiarSesionActiva = cerrarSesion; return () => { limpiarSesionActiva = null; }; }, [cerrarSesion]);

  const value = useMemo(() => ({ estado, iniciarSesion, registrar, cerrarSesion }), [estado, iniciarSesion, registrar, cerrarSesion]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
}

export async function obtenerTokenGuardado() {
  return tokenEnMemoria;
}

export async function expirarSesion() {
  if (limpiarSesionActiva) await limpiarSesionActiva();
  else tokenEnMemoria = null;
}
