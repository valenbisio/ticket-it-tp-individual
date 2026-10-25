import { ApiUrl } from '@/constants/api';
import type { EstadoCompra } from '@/constants/compra-estado';

/** Compra tal como la devuelve el backend en `GET /api/usuarios/:usuarioId/compras`. */
export type CompraSerializada = {
  id: string;
  estado: EstadoCompra;
  cantidad: number;
  total: number;
  tipoEntrada: {
    nombre: string | null;
    precio: number | null;
  };
  evento: {
    nombre: string | null;
    descripcion: string | null;
    fecha: string | null;
    categoria: string | null;
    multimedia: string[];
  };
  /**
   * Días de calendario que faltan para el evento.
   * Es un número solo cuando la compra está CONFIRMADA; en el resto de los
   * estados vale `null`.
   */
  diasRestantesParaEvento: number | null;
};

type RespuestaCompras = {
  usuarioId: string;
  compras: CompraSerializada[];
};

/** Obtiene las compras del comprador indicado. */
export async function obtenerComprasDeUsuario(usuarioId: string): Promise<CompraSerializada[]> {
  const respuesta = await fetch(
    `${ApiUrl}/api/usuarios/${encodeURIComponent(usuarioId)}/compras`,
  );

  if (!respuesta.ok) {
    throw new Error(`No se pudieron obtener las compras (HTTP ${respuesta.status})`);
  }

  const datos = (await respuesta.json()) as RespuestaCompras;

  return datos.compras ?? [];
}