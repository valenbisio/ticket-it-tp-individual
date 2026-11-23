import React, { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PasswordVisibilityIcon } from '../components/common/PasswordVisibilityIcon.jsx';
import { useAuth } from '../contexts/auth-context.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

const nombreValido = (value) => /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(value.trim());
const requisitosPassword = [
  { label: 'Al menos 8 caracteres', cumple: (value) => value.length >= 8 },
  { label: 'Al menos un número', cumple: (value) => /\d/.test(value) },
];

export default function RegisterScreen() {
  const { registrar } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'comprador' });
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [campoEnfocado, setCampoEnfocado] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [errorAvatar, setErrorAvatar] = useState('');
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
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
  };
  const submit = async () => {
    const nextErrors = {};
    if (!nombreValido(form.nombre)) nextErrors.nombre = 'Solo se permiten letras, espacios o apóstrofes.';
    if (!nombreValido(form.apellido)) nextErrors.apellido = 'Solo se permiten letras, espacios o apóstrofes.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
    if (!requisitosPassword.every(({ cumple }) => cumple(form.password))) nextErrors.password = 'La contraseña debe cumplir los requisitos indicados.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      AccessibilityInfo.announceForAccessibility('Hay campos para corregir. Revisá los mensajes debajo de cada campo.');
      return;
    }
    setErrors({});
    setEnviando(true);
    try {
      await registrar({ ...form, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim().toLowerCase(), ...(avatar ? { avatar } : {}) });
    } catch (error) {
      const message = error.message || 'No se pudo crear la cuenta.';
      const key = /email|cuenta/i.test(message) ? 'email' : /apellido/i.test(message) ? 'apellido' : /nombre/i.test(message) ? 'nombre' : 'password';
      setErrors({ [key]: message });
      AccessibilityInfo.announceForAccessibility(message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Elegí cómo querés usar AI Ticket It</Text>
        <View style={styles.avatarSection}>
          {avatar ? <Image accessibilityLabel="Vista previa de la foto de perfil" source={{ uri: avatar }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={32} color={colors.onPrimaryContainer} /></View>}
          <Pressable accessibilityRole="button" accessibilityLabel={avatar ? 'Cambiar foto de perfil' : 'Agregar foto de perfil opcional'} accessibilityHint="Podés crear la cuenta sin subir una foto" onPress={elegirFoto} style={styles.photoButton}>
            <Ionicons name="camera-outline" size={18} color={colors.onPrimary} />
            <Text style={styles.photoButtonText}>{avatar ? 'Cambiar foto' : 'Agregar foto (opcional)'}</Text>
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
            <TextInput accessibilityLabel={label} accessibilityState={{ invalid: !!errors[key] }} autoComplete={key === 'email' ? 'email' : 'name'} textContentType={contentType} autoCapitalize={key === 'email' ? 'none' : 'words'} autoCorrect={false} keyboardType={key === 'email' ? 'email-address' : 'default'} returnKeyType="next" value={form[key]} onFocus={() => setCampoEnfocado(key)} onBlur={() => setCampoEnfocado(null)} onChangeText={(value) => update(key, value)} placeholder={label} placeholderTextColor={colors.outline} style={[styles.input, campoEnfocado === key && styles.inputFocused, errors[key] && styles.inputError]} />
            {!!errors[key] && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errors[key]}</Text>}
          </View>
        ))}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            accessibilityLabel="Contraseña"
            accessibilityState={{ invalid: !!errors.password }}
            autoComplete="new-password"
            textContentType="newPassword"
            autoCapitalize="none"
            secureTextEntry={!mostrarPassword}
            returnKeyType="done"
            value={form.password}
            onFocus={() => setCampoEnfocado('password')}
            onBlur={() => setCampoEnfocado(null)}
            onChangeText={(value) => update('password', value)}
            placeholder="Creá una contraseña"
            placeholderTextColor={colors.outline}
            style={[styles.input, styles.passwordInput, campoEnfocado === 'password' && styles.inputFocused, errors.password && styles.inputError]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityState={{ pressed: mostrarPassword }}
            onPress={() => setMostrarPassword((actual) => !actual)}
            style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
          >
            <PasswordVisibilityIcon visible={mostrarPassword} color={mostrarPassword ? colors.primary : colors.onSurfaceVariant} size={22} />
          </Pressable>
        </View>
        <View accessibilityLabel="Requisitos de la contraseña" style={styles.requirements}>
          {requisitosPassword.map(({ label, cumple }) => <Text key={label} accessibilityLiveRegion="polite" style={[styles.requirement, cumple(form.password) && styles.requirementMet]}>{cumple(form.password) ? '✓' : '○'} {label}</Text>)}
        </View>
        {!!errors.password && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{errors.password}</Text>}
        <Text style={styles.label}>Rol</Text>
        <View style={styles.roles}>
          {[['comprador', 'Comprador'], ['organizador', 'Organizador']].map(([value, label]) => (
            <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: form.rol === value }} onFocus={() => setCampoEnfocado(`rol-${value}`)} onBlur={() => setCampoEnfocado(null)} onPress={() => update('rol', value)} style={[styles.role, form.rol === value && styles.roleSelected, campoEnfocado === `rol-${value}` && styles.roleFocused]}><Text style={[styles.roleText, form.rol === value && styles.roleTextSelected]}>{label}</Text></Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: enviando }} onPress={submit} disabled={enviando} style={styles.button}>{enviando ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Creando cuenta" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}</Pressable>
        <View style={styles.linkRow}>
          <Text style={styles.muted}>¿Ya tenés cuenta?</Text>
          <Link accessibilityRole="link" href="/" style={styles.link}>Iniciar sesión</Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  card: { width: '100%', maxWidth: 420, backgroundColor: colors.surfaceContainerLow, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.surfaceContainerHigh },
  title: { color: colors.onSurface, fontWeight: '800', fontSize: 27, textAlign: 'center' }, subtitle: { color: colors.onSurfaceVariant, textAlign: 'center', marginVertical: spacing.sm },
  avatarSection: { alignItems: 'center', marginVertical: spacing.md, gap: spacing.sm }, avatar: { width: 96, height: 96, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHigh }, avatarPlaceholder: { width: 96, height: 96, borderRadius: borderRadius.full, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }, photoButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.md }, photoButtonText: { color: colors.onPrimary, fontWeight: '700' },
  field: { marginBottom: spacing.xs }, label: { color: colors.onSurface, fontWeight: '700', marginBottom: spacing.xs, fontSize: 15 },
  input: { flex: 1, color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: spacing.md, minHeight: 52, fontSize: 16, marginBottom: spacing.sm }, inputFocused: { borderColor: colors.focus, borderWidth: 2 }, inputError: { borderColor: colors.error, borderWidth: 2 },
  error: { color: colors.error, marginTop: -spacing.xs, marginBottom: spacing.sm, fontSize: 14 },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 48 },
  eyeButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full || 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButtonPressed: { opacity: 0.6, backgroundColor: colors.surfaceContainerHighest },
  requirements: { gap: 4, marginTop: -spacing.xs, marginBottom: spacing.md }, requirement: { color: colors.onSurfaceVariant, fontSize: 14 }, requirementMet: { color: colors.success, fontWeight: '700' },
  roles: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }, role: { flex: 1, minHeight: 48, padding: spacing.md, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' }, roleSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceContainerHighest }, roleFocused: { borderColor: colors.focus, borderWidth: 2 }, roleText: { color: colors.onSurfaceVariant, fontWeight: '700' }, roleTextSelected: { color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 52, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: colors.onPrimary, fontWeight: '800' }, linkRow: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, minHeight: 72, paddingBottom: spacing.xs }, muted: { color: colors.onSurfaceVariant, textAlign: 'center' }, link: { color: colors.primary, fontWeight: '700', minHeight: 44, paddingHorizontal: spacing.md, textAlign: 'center', textAlignVertical: 'center' },
});
