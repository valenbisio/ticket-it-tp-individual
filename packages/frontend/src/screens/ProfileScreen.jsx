import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../contexts/AppContext.jsx';
import { useAuth } from '../contexts/auth-context.jsx';
import { BottomTabBar } from '../components/common/BottomTabBar.jsx';
import { Header } from '../components/common/Header.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, cerrarSesion } = useApp();
  const { estado, actualizarPerfil } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '' });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [errorAvatar, setErrorAvatar] = useState('');

  useEffect(() => {
    if (estado?.usuario) {
      setForm({ nombre: estado.usuario.nombre, apellido: estado.usuario.apellido, email: estado.usuario.email });
      setAvatar(estado.usuario.avatar || null);
    }
  }, [estado?.usuario]);

  const update = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: '' }));
    setMensaje('');
  };

  const guardar = async () => {
    const nuevosErrores = {};
    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(form.nombre.trim())) nuevosErrores.nombre = 'Ingresá un nombre con letras.';
    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(form.apellido.trim())) nuevosErrores.apellido = 'Ingresá un apellido con letras.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nuevosErrores.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) {
      AccessibilityInfo.announceForAccessibility('Revisá los campos marcados.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfil({ ...form, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim().toLowerCase(), avatar });
      setMensaje('Perfil actualizado correctamente.');
      AccessibilityInfo.announceForAccessibility('Perfil actualizado correctamente.');
    } catch (error) {
      const message = error.message || 'No se pudo guardar el perfil.';
      setErrores({ email: message });
      AccessibilityInfo.announceForAccessibility(message);
    } finally {
      setGuardando(false);
    }
  };

  const elegirFoto = async () => {
    setErrorAvatar('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorAvatar('Necesitamos permiso para acceder a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.55, base64: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      setErrorAvatar('No se pudo leer la imagen seleccionada. Probá con otra.');
      return;
    }
    if (asset.base64.length > 4_500_000) {
      setErrorAvatar('La imagen ocupa demasiado. Elegí una imagen más pequeña.');
      return;
    }
    setAvatar(`data:image/jpeg;base64,${asset.base64}`);
    setMensaje('');
  };

  const salir = async () => {
    await cerrarSesion();
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <Header title="Mi perfil" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>Tus datos</Text>
          <Text style={styles.subtitle}>Podés actualizar tus datos personales. El rol queda asociado a tu cuenta.</Text>
          <View style={styles.avatarSection}>
            {avatar ? <Image accessibilityLabel="Foto de perfil actual" source={{ uri: avatar }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={36} color={colors.onPrimaryContainer} /></View>}
            <Pressable accessibilityRole="button" accessibilityLabel={avatar ? 'Cambiar foto de perfil' : 'Subir foto de perfil'} onPress={elegirFoto} style={styles.photoButton}>
              <Ionicons name="camera-outline" size={18} color={colors.onPrimary} />
              <Text style={styles.photoButtonText}>{avatar ? 'Cambiar foto' : 'Subir foto'}</Text>
            </Pressable>
            {!!errorAvatar && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errorAvatar}</Text>}
          </View>
          {[
            ['nombre', 'Nombre', 'givenName'],
            ['apellido', 'Apellido', 'familyName'],
            ['email', 'Email', 'emailAddress'],
          ].map(([key, label, contentType]) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput accessibilityLabel={label} accessibilityState={{ invalid: !!errores[key] }} autoCapitalize={key === 'email' ? 'none' : 'words'} autoCorrect={false} keyboardType={key === 'email' ? 'email-address' : 'default'} textContentType={contentType} autoComplete={key === 'email' ? 'email' : 'name'} value={form[key]} onChangeText={(value) => update(key, value)} style={[styles.input, errores[key] && styles.inputError]} />
              {!!errores[key] && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errores[key]}</Text>}
            </View>
          ))}
          <Text style={styles.label}>Rol</Text>
          <Text accessibilityLabel={`Rol: ${currentUser.role === 'organizer' ? 'Organizador' : 'Comprador'}`} style={styles.role}>{currentUser.role === 'organizer' ? 'Organizador' : 'Comprador'}</Text>
          {!!mensaje && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.success}>{mensaje}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: guardando }} onPress={guardar} disabled={guardando} style={styles.button}>
            {guardando ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Guardando perfil" /> : <Text style={styles.buttonText}>Guardar cambios</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={salir} style={styles.logout}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable>
        </View>
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, padding: spacing.md, justifyContent: 'center' },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: colors.surfaceContainerLow, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.surfaceContainerHigh, padding: spacing.lg },
  title: { color: colors.onSurface, fontWeight: '800', fontSize: 24 },
  subtitle: { color: colors.onSurfaceVariant, lineHeight: 20, marginTop: spacing.xs, marginBottom: spacing.md },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  avatar: { width: 104, height: 104, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHigh },
  avatarPlaceholder: { width: 104, height: 104, borderRadius: borderRadius.full, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  photoButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.md },
  photoButtonText: { color: colors.onPrimary, fontWeight: '700' },
  field: { marginBottom: spacing.sm },
  label: { color: colors.onSurface, fontWeight: '700', marginBottom: spacing.xs },
  input: { minHeight: 52, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainer, color: colors.onSurface, fontSize: 16 },
  inputError: { borderColor: colors.error, borderWidth: 2 },
  error: { color: colors.error, marginTop: 4 },
  role: { color: colors.onSurfaceVariant, minHeight: 48, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surfaceContainer, overflow: 'hidden' },
  success: { color: colors.success, marginTop: spacing.md, fontWeight: '700' },
  button: { minHeight: 52, borderRadius: borderRadius.md, marginTop: spacing.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  buttonText: { color: colors.onPrimary, fontWeight: '800' },
  logout: { minHeight: 48, marginTop: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: colors.error, fontWeight: '700' },
});
