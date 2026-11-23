import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext.jsx';
import { colors, spacing, borderRadius } from '../../data/theme.js';

export const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole, purchases, unreadMessagesCount } = useApp();

  const buyerActivePurchasesCount = purchases.filter(
    (p) => p.status === 'confirmada' || p.status === 'pendiente de pago'
  ).length;

  if (currentRole === 'buyer') {
    const isExplore = pathname.includes('explore') || pathname === '/' || pathname === '';
    const isPurchases = pathname.includes('purchases');
    const isMessages = pathname.includes('messages');
    const isProfile = pathname.includes('profile');

    return (
      <View style={styles.tabBarContainer}>
        {/* Tab 1: Explorar */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Explorar catálogo de eventos"
          onPress={() => router.push('/(buyer)/explore')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isExplore && styles.activeIconBox]}>
            <Ionicons
              name={isExplore ? 'compass' : 'compass-outline'}
              size={22}
              color={isExplore ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <Text style={[styles.tabLabel, isExplore && styles.activeTabLabel]}>
            Explorar
          </Text>
        </Pressable>

        {/* Tab 2: Mis Compras */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Mis compras y tickets adquiridos"
          onPress={() => router.push('/(buyer)/purchases')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isPurchases && styles.activeIconBox]}>
            <Ionicons
              name={isPurchases ? 'ticket' : 'ticket-outline'}
              size={22}
              color={isPurchases ? colors.primary : colors.onSurfaceVariant}
            />
            {buyerActivePurchasesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{buyerActivePurchasesCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, isPurchases && styles.activeTabLabel]}>
            Mis compras
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel={unreadMessagesCount ? `Mensajes, ${unreadMessagesCount} sin leer` : 'Mensajes'}
          accessibilityState={{ selected: isMessages }}
          onPress={() => router.push('/messages')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isMessages && styles.activeIconBox]}>
            <Ionicons
              name={isMessages ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={22}
              color={isMessages ? colors.primary : colors.onSurfaceVariant}
            />
            {unreadMessagesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, isMessages && styles.activeTabLabel]}>Mensajes</Text>
        </Pressable>

        {/* Tab: Perfil */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Ver y editar perfil"
          accessibilityState={{ selected: isProfile }}
          onPress={() => router.push('/profile')}
          style={styles.tabItem}
        >
          <View style={[styles.iconBox, isProfile && styles.activeIconBox]}>
            <Ionicons
              name={isProfile ? 'person' : 'person-outline'}
              size={22}
              color={isProfile ? colors.primary : colors.onSurfaceVariant}
            />
          </View>
          <Text style={[styles.tabLabel, isProfile && styles.activeTabLabel]}>Perfil</Text>
        </Pressable>
      </View>
    );
  }

  // Organizer bottom tabs
  const isEvents = pathname.includes('events');
  const isCreate = pathname.includes('create');
  const isMessages = pathname.includes('messages');
  const isProfile = pathname.includes('profile');

  return (
    <View style={styles.tabBarContainer}>
      {/* Tab 1: Mis Eventos */}
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Lista de mis eventos publicados"
        onPress={() => router.push('/(organizer)/events')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, isEvents && styles.activeIconBox]}>
          <Ionicons
            name={isEvents ? 'calendar' : 'calendar-outline'}
            size={22}
            color={isEvents ? colors.primary : colors.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.tabLabel, isEvents && styles.activeTabLabel]}>
          Mis Eventos
        </Text>
      </Pressable>

      {/* Tab 2: Crear Evento */}
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Publicar nuevo evento"
        onPress={() => router.push('/(organizer)/create')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, styles.createIconBox]}>
          <Ionicons name="add" size={24} color={colors.onTertiary} />
        </View>
        <Text style={[styles.tabLabel, isCreate && styles.activeTabLabel]}>
          Crear Evento
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={unreadMessagesCount ? `Mensajes, ${unreadMessagesCount} sin leer` : 'Mensajes'}
        accessibilityState={{ selected: isMessages }}
        onPress={() => router.push('/messages')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, isMessages && styles.activeIconBox]}>
          <Ionicons
            name={isMessages ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
            size={22}
            color={isMessages ? colors.primary : colors.onSurfaceVariant}
          />
          {unreadMessagesCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, isMessages && styles.activeTabLabel]}>Mensajes</Text>
      </Pressable>

      {/* Tab: Perfil */}
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Ver y editar perfil"
        accessibilityState={{ selected: isProfile }}
        onPress={() => router.push('/profile')}
        style={styles.tabItem}
      >
        <View style={[styles.iconBox, isProfile && styles.activeIconBox]}>
          <Ionicons
            name={isProfile ? 'person' : 'person-outline'}
            size={22}
            color={isProfile ? colors.primary : colors.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.tabLabel, isProfile && styles.activeTabLabel]}>Perfil</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIconBox: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  createIconBox: {
    backgroundColor: colors.tertiaryContainer,
  },
  iconText: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
  },
  activeIconText: {
    color: colors.primary,
  },
  createIconText: {
    color: colors.onTertiary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.onPrimaryContainer,
    fontSize: 9,
    fontWeight: 'bold',
  },
});
