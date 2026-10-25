/**
 * URL base del backend. Se puede sobreescribir con la variable de entorno
 * `EXPO_PUBLIC_API_URL` (por ejemplo, para apuntar a una IP de la red local
 * cuando se prueba la app en un dispositivo físico).
 */
export const ApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Comprador de ejemplo: la aplicación todavía no tiene autenticación, así que
 * se usa el mismo usuario que crea el seed del backend.
 */
export const CompradorDemoId = 'usuario-1';