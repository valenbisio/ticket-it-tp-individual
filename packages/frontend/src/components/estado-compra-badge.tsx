import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { estiloDeEstado } from '@/constants/compra-estado';
import { Spacing } from '@/constants/theme';

/** Badge que distingue visualmente el estado de una compra. */
export function EstadoCompraBadge({ estado }: { estado: string }) {
  const estilo = estiloDeEstado(estado);

  return (
    <View style={[styles.badge, { backgroundColor: estilo.background }]}>
      <ThemedText type="smallBold" style={[styles.texto, { color: estilo.color }]}>
        {estilo.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half,
  },
  texto: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});