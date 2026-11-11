import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const RoleSelectScreen = () => {
  const router = useRouter();
  const { currentRole, setRole, currentUser, setUser, users, showToast } = useApp();

  const handleSelectBuyer = async () => {
    if (!await setUser('juan')) return;
    showToast('Ingresando como Comprador (Juan Pérez)', 'success');
    router.push('/(buyer)/explore');
  };

  const handleSelectOrganizer = async () => {
    if (!await setUser('salanorte')) return;
    showToast('Ingresando como Organizador (Sala Norte)', 'success');
    router.push('/(organizer)/events');
  };

  return (
    <View style={styles.centerContainer}>
      <View style={styles.innerContent}>
        {/* Brand Icon & Heading */}
        <View style={styles.heroHeader}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIcon}>🎟️</Text>
          </View>
          <Text style={styles.appName}>AI Ticket It</Text>
          <Text style={styles.appTagline}>
            Descubrimiento y venta segura de entradas para eventos en vivo
          </Text>
          <View style={styles.accentBadge}>
            <Text style={styles.accentBadgeText}>Selecciona tu perfil de acceso</Text>
          </View>
        </View>

        {/* Two Large & Attractive Role Buttons */}
        <View style={styles.buttonsGroup}>
          {/* Button 1: Soy Comprador */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Soy Comprador: Explorar catálogo de espectáculos y comprar entradas"
            onPress={handleSelectBuyer}
            style={({ pressed }) => [
              styles.roleCard,
              styles.buyerCard,
              currentRole === 'buyer' && styles.selectedBuyerCard,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roleIconBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.roleEmoji}>🎵</Text>
              </View>
              <View style={styles.cardTitleCol}>
                <View style={styles.titleWithBadge}>
                  <Text style={styles.roleTitle}>Soy Comprador</Text>
                  {currentRole === 'buyer' && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Activo</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.roleDescription}>
                  Explorar catálogo, reservar con QR dinámico y chatear con organizadores
                </Text>
              </View>
              <View style={styles.arrowBox}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.featureItem}>⚡ Pases anti-fraude</Text>
              <Text style={styles.featureItem}>💬 Chat directo</Text>
            </View>
          </Pressable>

          {/* Button 2: Soy Organizador */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Soy Organizador: Publicar eventos, definir precios y cupos, y gestionar ventas"
            onPress={handleSelectOrganizer}
            style={({ pressed }) => [
              styles.roleCard,
              styles.organizerCard,
              currentRole === 'organizer' && styles.selectedOrgCard,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roleIconBox, { backgroundColor: colors.tertiary }]}>
                <Text style={styles.roleEmoji}>🎪</Text>
              </View>
              <View style={styles.cardTitleCol}>
                <View style={styles.titleWithBadge}>
                  <Text style={styles.roleTitle}>Soy Organizador</Text>
                  {currentRole === 'organizer' && (
                    <View style={[styles.activePill, { backgroundColor: colors.tertiaryContainer }]}>
                      <Text style={[styles.activePillText, { color: colors.onTertiary }]}>Activo</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.roleDescription}>
                  Publicar eventos, configurar tipos de entrada y controlar aforo en vivo
                </Text>
              </View>
              <View style={styles.arrowBox}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.featureItem, { color: colors.tertiary }]}>📊 Métricas en tiempo real</Text>
              <Text style={[styles.featureItem, { color: colors.tertiary }]}>🎟️ Check-in de accesos</Text>
            </View>
          </Pressable>
        </View>

        {/* Pre-loaded In-Memory Simulated Users */}
        <View style={styles.sandboxBox}>
          <Text style={styles.sandboxTitle}>Usuarios precargados en memoria:</Text>
          <View style={styles.usersGrid}>
            {users.slice(0, 2).map((u) => {
              const isSelected = currentUser.role === u.role;
              return (
                <Pressable
                  key={u.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar usuario ${u.name}`}
                  onPress={() => {
                    setUser(u.id);
                    setRole(u.role);
                  }}
                  style={[styles.userChip, isSelected && styles.selectedUserChip]}
                >
                  <Image source={{ uri: u.avatar }} style={styles.userChipAvatar} />
                  <View style={styles.userChipTextCol}>
                    <Text style={styles.userChipName} numberOfLines={1}>
                      {u.name}
                    </Text>
                    <Text style={styles.userChipRole}>
                      {u.role === 'buyer' ? 'Comprador' : 'Organizador'}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  innerContent: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandIconBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  brandIcon: {
    fontSize: 28,
  },
  appName: {
    color: colors.onSurface,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
    lineHeight: 18,
  },
  accentBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  accentBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonsGroup: {
    width: '100%',
    gap: spacing.md,
  },
  roleCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buyerCard: {
    borderColor: 'rgba(192, 193, 255, 0.25)',
  },
  selectedBuyerCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  organizerCard: {
    borderColor: 'rgba(76, 215, 246, 0.25)',
  },
  selectedOrgCard: {
    borderColor: colors.tertiary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  roleEmoji: {
    fontSize: 24,
  },
  cardTitleCol: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTitle: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: '800',
  },
  activePill: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 6,
  },
  activePillText: {
    color: colors.onPrimaryContainer,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  roleDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrowText: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  featureItem: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  sandboxBox: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  sandboxTitle: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  usersGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  userChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedUserChip: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  userChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  userChipTextCol: {
    flex: 1,
  },
  userChipName: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  userChipRole: {
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  checkIcon: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
});
export default RoleSelectScreen;
