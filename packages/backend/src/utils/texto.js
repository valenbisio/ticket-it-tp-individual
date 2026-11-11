/**
 * Normaliza texto para búsquedas: minúsculas, sin tildes y sin espacios sobrantes.
 */
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}