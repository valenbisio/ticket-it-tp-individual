/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const AuthContext = createContext(null);
let limpiarSesionActiva = null;
let tokenEnMemoria = null;

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let activo = true;

    void (async () => {
      try {
        const token = tokenEnMemoria;
        if (!token) {
          if (activo) setEstado(null);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          tokenEnMemoria = null;
          if (activo) setEstado(null);
          return;
        }

        const data = await response.json();
        if (activo) setEstado({ token, usuario: data.usuario });
      } catch {
        if (activo) setEstado(null);
      }
    })();

    return () => { activo = false; };
  }, []);

  const guardarSesion = useCallback(async (response) => {
    const data = await response.json();
    if (!response.ok || !data?.token || !data?.usuario) {
      throw new Error(data?.message ?? 'No se pudo iniciar sesión');
    }
    tokenEnMemoria = data.token;
    setEstado(data);
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await guardarSesion(response);
  }, [guardarSesion]);

  const registrar = useCallback(async (datos) => {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    await guardarSesion(response);
  }, [guardarSesion]);

  const cerrarSesion = useCallback(async () => {
    tokenEnMemoria = null;
    setEstado(null);
  }, []);

  useEffect(() => {
    limpiarSesionActiva = cerrarSesion;
    return () => {
      if (limpiarSesionActiva === cerrarSesion) limpiarSesionActiva = null;
    };
  }, [cerrarSesion]);

  const value = useMemo(
    () => ({ estado, iniciarSesion, registrar, cerrarSesion }),
    [estado, iniciarSesion, registrar, cerrarSesion],
  );

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
