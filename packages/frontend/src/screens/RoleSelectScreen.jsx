import React, { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { PasswordVisibilityIcon } from '../components/common/PasswordVisibilityIcon.jsx';
import { useAuth } from '../contexts/auth-context.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const RoleSelectScreen = () => {
  const { iniciarSesion, estado } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [campoEnfocado, setCampoEnfocado] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const login = async () => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
    if (!password) nextErrors.password = 'Ingresá tu contraseña.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); AccessibilityInfo.announceForAccessibility('Revisá los campos marcados.'); return; }
    setErrors({});
    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
      // AppContext carga la sesión y redirige según el rol.
    } catch (e) {
      const message = e.message || 'No se pudo iniciar sesión';
      setErrors({ password: message });
      AccessibilityInfo.announceForAccessibility(`Error al iniciar sesión. ${message}`);
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'cargando') return <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="Verificando sesión"><ActivityIndicator color={colors.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">🎟️</Text>
        <Text accessibilityRole="header" style={styles.title}>AI Ticket It</Text>
        <Text style={styles.subtitle}>Ingresá a tu cuenta para continuar</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput accessibilityLabel="Email" accessibilityState={{ invalid: !!errors.email }} accessibilityHint="Ingresá el email asociado a tu cuenta" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" returnKeyType="next" value={email} onFocus={() => setCampoEnfocado('email')} onBlur={() => setCampoEnfocado(null)} onChangeText={(value) => { setEmail(value); setErrors((actual) => ({ ...actual, email: '' })); }} placeholder="tu@email.com" placeholderTextColor={colors.outline} style={[styles.input, campoEnfocado === 'email' && styles.inputFocused, errors.email && styles.inputError]} />
        {!!errors.email && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errors.email}</Text>}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}><TextInput accessibilityLabel="Contraseña" accessibilityState={{ invalid: !!errors.password }} accessibilityHint="Ingresá tu contraseña" autoComplete="current-password" textContentType="password" autoCapitalize="none" secureTextEntry={!mostrarPassword} returnKeyType="go" value={password} onFocus={() => setCampoEnfocado('password')} onBlur={() => setCampoEnfocado(null)} onChangeText={(value) => { setPassword(value); setErrors((actual) => ({ ...actual, password: '' })); }} onSubmitEditing={login} placeholder="Tu contraseña" placeholderTextColor={colors.outline} style={[styles.input, styles.passwordInput, campoEnfocado === 'password' && styles.inputFocused, errors.password && styles.inputError]} /><Pressable accessibilityRole="button" accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} accessibilityState={{ pressed: mostrarPassword }} onPress={() => setMostrarPassword((actual) => !actual)} style={styles.eyeButton}><PasswordVisibilityIcon visible={mostrarPassword} /><Text style={styles.eyeText}>{mostrarPassword ? 'Ocultar' : 'Ver'}</Text></Pressable></View>
        {!!errors.password && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errors.password}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: enviando }} accessibilityLiveRegion="polite" onPress={login} disabled={enviando} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          {enviando ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Iniciando sesión" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
        </Pressable>
        <View style={styles.linkRow}>
          <Text style={styles.muted}>¿No tenés cuenta?</Text>
          <Link accessibilityRole="link" href="/register" style={styles.link}>Crear una cuenta</Link>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  card: { width: '100%', maxWidth: 420, backgroundColor: colors.surfaceContainerLow, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.surfaceContainerHigh },
  icon: { fontSize: 38, textAlign: 'center' }, title: { color: colors.onSurface, fontWeight: '800', fontSize: 28, textAlign: 'center', marginTop: spacing.xs },
  subtitle: { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { color: colors.onSurface, fontWeight: '700', marginBottom: spacing.xs },
  input: { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: spacing.md, paddingVertical: 14, minHeight: 52, marginBottom: spacing.md, fontSize: 16 }, inputFocused: { borderColor: colors.focus, borderWidth: 2 },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', justifyContent: 'center', minHeight: 52, marginTop: spacing.xs }, pressed: { opacity: 0.8 }, buttonText: { color: colors.onPrimary, fontWeight: '800' },
  error: { color: colors.error, marginBottom: spacing.sm, fontSize: 14 }, linkRow: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, minHeight: 72, paddingBottom: spacing.xs }, muted: { color: colors.onSurfaceVariant, textAlign: 'center' }, link: { color: colors.primary, fontWeight: '700', minHeight: 44, paddingHorizontal: spacing.md, textAlign: 'center', textAlignVertical: 'center' },
  passwordRow: { position: 'relative', width: '100%', justifyContent: 'center' }, passwordInput: { width: '100%', paddingRight: 96 }, eyeButton: { position: 'absolute', top: 2, right: 2, height: 48, minWidth: 88, flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center' }, eyeIcon: { fontSize: 18 }, eyeText: { color: colors.primary, fontSize: 14, fontWeight: '700' }, inputError: { borderColor: colors.error, borderWidth: 2 },
});
export default RoleSelectScreen;
