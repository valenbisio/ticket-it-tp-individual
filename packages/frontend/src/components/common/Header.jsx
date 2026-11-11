/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext.jsx';
import { colors, spacing, borderRadius } from '../../data/theme.js';

export const Header = ({ title, subtitle, showBack = false, onBack }) => {
  const router = useRouter();
  const { currentRole, currentUser } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.contentRow}>
        {/* Left: Back button or Logo */}
        <View style={styles.leftGroup}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver atrás"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🎟️</Text>
            </View>
          )}

          <View style={styles.titleColumn}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>AI Ticket It</Text>
              <View style={styles.aiTag}>
                <Text style={styles.aiTagText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.subtitleText}>
              {title || subtitle || (currentRole === 'buyer' ? 'Explorar' : 'Gestión')}
            </Text>
          </View>
        </View>

        {/* Right: Active Role badge & User Avatar */}
        <View style={styles.rightGroup}>
          <View style={styles.rolePill}>
            <View
              style={[
                styles.roleDot,
                { backgroundColor: currentRole === 'buyer' ? colors.primary : colors.tertiary },
              ]}
            />
            <Text style={styles.roleText}>
              {currentRole === 'buyer' ? 'Comprador' : 'Organizador'}
            </Text>
          </View>

          {currentUser?.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {currentUser?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backButtonText: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoIcon: {
    fontSize: 18,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  aiTag: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
  },
  aiTagText: {
    color: colors.tertiary,
    fontSize: 9,
    fontWeight: '800',
  },
  subtitleText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '500',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  roleText: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.onPrimaryContainer,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
