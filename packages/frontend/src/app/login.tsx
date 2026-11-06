import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth, type Rol } from '@/contexts/auth-context';

export default function LoginScreen() {
  const { iniciarSesion, registrar } = useAuth();
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('comprador');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setCargando(true); setError(null);
    try {
      if (modoRegistro) await registrar({ nombre, apellido, email, password, rol });
      else await iniciarSesion(email, password);
      router.replace('/' as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la operación');
    } finally { setCargando(false); }
  };

  return (
    <ThemedView style={styles.pantalla}>
      <View style={styles.formulario}>
        <ThemedText type="title">Ticket It</ThemedText>
        <ThemedText type="subtitle">{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</ThemedText>
        {modoRegistro && <>
          <Campo value={nombre} onChangeText={setNombre} placeholder="Nombre" />
          <Campo value={apellido} onChangeText={setApellido} placeholder="Apellido" />
          <View style={styles.roles}>
            {(['comprador', 'organizador'] as const).map((opcion) => <Pressable key={opcion} onPress={() => setRol(opcion)} style={[styles.rol, rol === opcion && styles.rolActivo]}>
              <ThemedText>{opcion === 'comprador' ? 'Comprador' : 'Organizador'}</ThemedText>
            </Pressable>)}
          </View>
        </>}
        <Campo value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <Campo value={password} onChangeText={setPassword} placeholder="Contraseña (mínimo 8 caracteres)" secureTextEntry />
        {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        <Pressable style={styles.boton} onPress={() => void enviar()} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.textoBoton}>{modoRegistro ? 'Registrarme' : 'Entrar'}</ThemedText>}
        </Pressable>
        <Pressable onPress={() => { setModoRegistro(!modoRegistro); setError(null); }}>
          <ThemedText type="link">{modoRegistro ? 'Ya tengo cuenta' : 'Crear una cuenta'}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function Campo(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} placeholderTextColor="#777" style={styles.campo} />;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  formulario: { width: '100%', maxWidth: 420, gap: Spacing.three },
  campo: { borderWidth: 1, borderColor: '#888', borderRadius: 10, padding: 14, color: '#111', backgroundColor: '#fff' },
  roles: { flexDirection: 'row', gap: Spacing.two },
  rol: { flex: 1, padding: Spacing.three, borderWidth: 1, borderColor: '#888', borderRadius: 10, alignItems: 'center' },
  rolActivo: { borderColor: '#208AEF', borderWidth: 2 },
  boton: { backgroundColor: '#208AEF', minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { color: '#fff', fontWeight: '700' },
  error: { color: '#b00020' },
});
