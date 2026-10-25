import { StyleSheet, View } from 'react-native';

import { EstadoCompraBadge } from './estado-compra-badge';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import {
  formatearFecha,
  formatearPrecio,
  textoDiasRestantes,
} from '@/constants/compra-estado';
import { Spacing } from '@/constants/theme';
import type { CompraSerializada } from '@/services/compras';

/** Tarjeta con el detalle de una compra: evento, estado, entradas y total. */
export function CompraCard({ compra }: { compra: CompraSerializada }) {
  const diasRestantes = textoDiasRestantes(compra.diasRestantesParaEvento);
  const tipoEntrada = compra.tipoEntrada.nombre ? ` (${compra.tipoEntrada.nombre})` : '';
  const entradas = `${compra.cantidad} ${compra.cantidad === 1 ? 'entrada' : 'entradas'}${tipoEntrada}`;

  return (
    <ThemedView type="backgroundElement" style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <ThemedText type="smallBold" style={styles.nombreEvento} numberOfLines={2}>
          {compra.evento.nombre ?? 'Evento sin nombre'}
        </ThemedText>
        <EstadoCompraBadge estado={compra.estado} />
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {formatearFecha(compra.evento.fecha)}
      </ThemedText>

      <View style={styles.filaDetalle}>
        <ThemedText type="small" themeColor="textSecondary">
          {entradas}
        </ThemedText>
        <ThemedText type="smallBold">{formatearPrecio(compra.total)}</ThemedText>
      </View>

      {diasRestantes && (
        <ThemedView type="backgroundSelected" style={styles.diasRestantes}>
          <ThemedText type="smallBold">{diasRestantes}</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nombreEvento: {
    flexShrink: 1,
    fontSize: 16,
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  diasRestantes: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
});