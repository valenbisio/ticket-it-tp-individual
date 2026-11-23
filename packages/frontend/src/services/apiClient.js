const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
let token = null;
let currentUserId = 'usuario-1';

export async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Error ${response.status}`);
  return data;
}

export function setToken(value, userId) {
  token = value;
  if (userId) currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId;
}

export function getApiUrl() {
  return API_URL;
}
