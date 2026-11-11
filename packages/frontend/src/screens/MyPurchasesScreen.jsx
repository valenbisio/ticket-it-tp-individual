import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { BottomTabBar } from '../components/common/BottomTabBar.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';
import { getDaysUntilEvent, getDaysLabel, canCancelPurchase } from '../utils/purchases.js';

const STATUS_TABS = ['Todas', 'Confirmadas', 'Pendientes', 'Utilizadas', 'Canceladas', 'Reembolsadas'];

export const MyPurchasesScreen = () => {
  const router = useRouter();
  const { purchases, setActiveQR, currentUser, cancelPurchase } = useApp();
  const [selectedTab, setSelectedTab] = useState('Todas');

  // Filter purchases by tab
  const filteredPurchases = useMemo(() => {
    let list = purchases.filter((p) => p.buyerId === currentUser.id);
    if (selectedTab === 'Confirmadas') {
      return list.filter((p) => p.status === 'confirmada');
    }
    if (selectedTab === 'Pendientes') {
      return list.filter((p) => p.status === 'pendiente de pago');
    }
    if (selectedTab === 'Utilizadas') {
      return list.filter((p) => p.status === 'utilizada');
    }
    if (selectedTab === 'Canceladas') {
      return list.filter((p) => p.status === 'cancelada');
    }
    if (selectedTab === 'Reembolsadas') {
      return list.filter((p) => p.status === 'reembolsada');
    }
    return list;
  }, [purchases, currentUser.id, selectedTab]);

  const handleCancel = (item) => {
    const isRefund = item.status === 'confirmada';
    Alert.alert(
      isRefund ? 'Cancelar y reembolsar' : 'Cancelar compra',
      isRefund
        ? `¿Querés cancelar tu compra de ${item.eventName}? Se te reembolsará el total de $${item.totalPrice?.toLocaleString('es-AR')}.`
        : `¿Querés cancelar tu compra pendiente de ${item.eventName}?`,
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelPurchase(item.id) },
      ]
    );
  };

  const renderPurchaseItem = ({ item }) => {
    const isConfirmed = item.status === 'confirmada';
    const isUsed = item.status === 'utilizada';
    const daysLabel = isConfirmed ? getDaysLabel(getDaysUntilEvent(item.eventDate)) : null;
    const isCancellable = canCancelPurchase(item);

    return (
      <View style={styles.purchaseCard}>
        {/* Top Header: Event & Status */}
        <View style={styles.cardTopRow}>
          <View style={styles.eventInfoCol}>
            <Text style={styles.eventName}>{item.eventName}</Text>
            <Text style={styles.eventDate}>📅 {item.eventDisplayDate || item.eventDate}</Text>
            {daysLabel && <Text style={styles.daysLeftText}>⏳ {daysLabel}</Text>}
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Ticket Details */}
        <View style={styles.detailsBox}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Entradas</Text>
            <Text style={styles.detailValue}>
              {item.tierName} × {item.quantity}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Pagado</Text>
            <Text style={styles.detailValuePrice}>${item.totalPrice?.toLocaleString('es-AR')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Código</Text>
            <Text style={styles.detailValueCode}>{item.id}</Text>
          </View>
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {/* Action 1: QR button if confirmada */}
          {isConfirmed && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver entrada con QR dinámico para ${item.eventName}`}
              onPress={() => setActiveQR(item)}
              style={({ pressed }) => [styles.qrActionBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.qrActionIcon}>⚡</Text>
              <Text style={styles.qrActionText}>Ver Entrada / QR</Text>
            </Pressable>
          )}

          {/* Action 2: Rate button if utilizada */}
          {isUsed && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Calificar evento ${item.eventName}`}
              onPress={() => router.push(`/(buyer)/rate/${item.id}`)}
              style={({ pressed }) => [
                styles.rateActionBtn,
                item.hasRated && styles.alreadyRatedBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.rateActionIcon}>★</Text>
              <Text style={styles.rateActionText}>
                {item.hasRated ? 'Calificado' : 'Calificar Evento'}
              </Text>
            </Pressable>
          )}

          {/* Action 3: Chat button with organizer */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir chat con organizador para compra ${item.id}`}
            onPress={() => router.push(`/(buyer)/chat/${item.id}`)}
            style={({ pressed }) => [styles.chatActionBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.chatActionIcon}>💬</Text>
            <Text style={styles.chatActionText}>Chat con Organizador</Text>
          </Pressable>
        </View>

        {/* Cancel button (solo si no está utilizada y el evento aún no se realizó) */}
        {isCancellable && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Cancelar compra ${item.id}`}
            onPress={() => handleCancel(item)}
            style={({ pressed }) => [styles.cancelActionBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.cancelActionText}>
              {isConfirmed ? 'Cancelar y reembolsar' : 'Cancelar compra'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header subtitle="Mis Compras" />

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item;
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedTab(item)}
                style={[styles.tabPill, isSelected && styles.selectedTabPill]}
              >
                <Text style={[styles.tabPillText, isSelected && styles.selectedTabPillText]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Purchases List */}
      <FlatList
        data={filteredPurchases}
        keyExtractor={(item) => item.id}
        renderItem={renderPurchaseItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyEmoji}>🎟️</Text>
            <Text style={styles.emptyTitle}>No tienes compras en este estado</Text>
            <Text style={styles.emptySubtitle}>
              Explora el catálogo y adquiere tus entradas con QR dinámico.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(buyer)/explore')}
              style={styles.exploreCta}
            >
              <Text style={styles.exploreCtaText}>Ir a Explorar Eventos</Text>
            </Pressable>
          </View>
        }
      />

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabsWrapper: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  selectedTabPill: {
    backgroundColor: colors.primaryContainer,
  },
  tabPillText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
  },
  selectedTabPillText: {
    color: colors.onPrimaryContainer,
    fontWeight: '800',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 24,
  },
  purchaseCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  eventName: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  eventDate: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  daysLeftText: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  cancelActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  cancelActionText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.outline,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  detailValuePrice: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  detailValueCode: {
    color: colors.outlineVariant,
    fontSize: 10,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  qrActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  qrActionIcon: {
    fontSize: 13,
    marginRight: 4,
    color: colors.onPrimary,
  },
  qrActionText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  rateActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiaryContainer,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  alreadyRatedBtn: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  rateActionIcon: {
    fontSize: 13,
    marginRight: 4,
    color: colors.onTertiary,
  },
  rateActionText: {
    color: colors.onTertiary,
    fontSize: 11,
    fontWeight: '800',
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  chatActionIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  chatActionText: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
  },
  emptyCenter: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  exploreCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    marginTop: 16,
  },
  exploreCtaText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
});
export default MyPurchasesScreen;
