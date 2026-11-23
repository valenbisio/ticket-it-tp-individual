/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { api } from '../services/api.js';

const TOKEN_KEY = 'ticket-it.session-token';

const AuthContext = createContext(null);
let limpiarSesionActiva = null;
let tokenEnMemoria = null;

export function AuthProvider({ children }) {
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let activo = true;

    void (async () => {
      try {
        const token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(TOKEN_KEY);
        tokenEnMemoria = token;
        if (!token) {
          if (activo) setEstado(null);
          return;
        }

        let data;
        try {
          data = await api.restoreSession(token);
        } catch {
          tokenEnMemoria = null;
          api.setToken(null);
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          if (activo) setEstado(null);
          return;
        }

        api.setToken(token, data.usuario.id);
        if (activo) setEstado({ token, usuario: data.usuario });
      } catch {
        tokenEnMemoria = null;
        api.setToken(null);
        if (activo) setEstado(null);
      }
    })();

    return () => { activo = false; };
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    try {
      if (Platform.OS !== 'web') await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    } catch {
      api.setToken(null);
      throw new Error('No se pudo guardar la sesión de forma segura en este dispositivo.');
    }
    tokenEnMemoria = data.token;
    setEstado(data);
  }, []);

  const registrar = useCallback(async (datos) => {
    const data = await api.register(datos);
    try {
      if (Platform.OS !== 'web') await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    } catch {
      api.setToken(null);
      throw new Error('No se pudo guardar la sesión de forma segura en este dispositivo.');
    }
    tokenEnMemoria = data.token;
    setEstado(data);
  }, []);

  const actualizarPerfil = useCallback(async (datos) => {
    const usuario = await api.updateProfile(datos);
    setEstado((actual) => actual ? { ...actual, usuario } : actual);
    return usuario;
  }, []);

  const cerrarSesion = useCallback(async () => {
    tokenEnMemoria = null;
    api.setToken(null);
    try {
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(TOKEN_KEY);
    } finally {
      setEstado(null);
    }
  }, []);

  useEffect(() => {
    limpiarSesionActiva = cerrarSesion;
    return () => {
      if (limpiarSesionActiva === cerrarSesion) limpiarSesionActiva = null;
    };
  }, [cerrarSesion]);

  const value = useMemo(
    () => ({ estado, iniciarSesion, registrar, actualizarPerfil, cerrarSesion }),
    [estado, iniciarSesion, registrar, actualizarPerfil, cerrarSesion],
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
