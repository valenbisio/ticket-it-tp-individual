import { authApi } from './authApi.js';
import { eventApi } from './eventApi.js';
import { purchaseApi } from './purchaseApi.js';
import { chatApi } from './chatApi.js';
import { reviewApi } from './reviewApi.js';
import { compraUI, eventoUI } from './mappers.js';

// Fachada compatibile con los imports existentes del resto de la app.
export const api = {
  ...authApi,
  ...eventApi,
  ...purchaseApi,
  ...chatApi,
  ...reviewApi,
};

export { eventoUI, compraUI };
