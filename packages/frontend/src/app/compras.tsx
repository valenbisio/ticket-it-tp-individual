import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompraCard } from '@/components/compra-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CompradorDemoId } from '@/constants/api';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { obtenerComprasDeUsuario, type CompraSerializada } from '@/services/compras';

export default function ComprasScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [compras, setCompras] = useState<CompraSerializada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCompras = useCallback(async () => {
    try {
      setError(null);
      const datos = await obtenerComprasDeUsuario(CompradorDemoId);
      setCompras(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    void cargarCompras();
  }, [cargarCompras]);

  const alRefrescar = useCallback(() => {
    setRefrescando(true);
    void cargarCompras();
  }, [cargarCompras]);

  const paddingSuperior =
    Platform.OS === 'web' ? Spacing.six + Spacing.four : insets.top + Spacing.four;

  if (cargando) {
    return (
      <ThemedView style={styles.centrado}>
        <ActivityIndicator color={theme.text} />
        <ThemedText type="small" themeColor="textSecondary">
          Cargando tus compras…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contenedor}>
      <FlatList
        data={compras}
        keyExtractor={(compra) => compra.id}
        renderItem={({ item }) => <CompraCard compra={item} />}
        ItemSeparatorComponent={Separador}
        contentContainerStyle={[
          styles.contenido,
          {
            maxWidth: MaxContentWidth,
            paddingTop: paddingSuperior,
            paddingLeft: insets.left + Spacing.four,
            paddingRight: insets.right + Spacing.four,
            paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={alRefrescar}
            tintColor={theme.text}
          />
        }
        ListHeaderComponent={<Encabezado cantidad={compras.length} error={error} />}
        ListEmptyComponent={<SinCompras />}
      />
    </ThemedView>
  );
}

function Encabezado({ cantidad, error }: { cantidad: number; error: string | null }) {
  return (
    <ThemedView style={styles.encabezado}>
      <ThemedText type="subtitle">Mis compras</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {cantidad === 1 ? '1 compra realizada' : `${cantidad} compras realizadas`}
      </ThemedText>
      {error && (
        <ThemedView style={styles.error}>
          <ThemedText type="small" style={styles.textoError}>
            {error}. Verificá que el backend esté corriendo en {''}
            <ThemedText type="code">http://localhost:8000</ThemedText>.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

function SinCompras() {
  return (
    <ThemedView type="backgroundElement" style={styles.sinCompras}>
      <ThemedText type="smallBold">Todavía no tenés compras</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.textoCentrado}>
        Cuando compres entradas para un evento van a aparecer acá.
      </ThemedText>
    </ThemedView>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  encabezado: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  error: {
    backgroundColor: '#FBD5D5',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  textoError: {
    color: '#8C1D1D',
  },
  sinCompras: {
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  textoCentrado: {
    textAlign: 'center',
  },
  separador: {
    height: Spacing.three,
  },
});