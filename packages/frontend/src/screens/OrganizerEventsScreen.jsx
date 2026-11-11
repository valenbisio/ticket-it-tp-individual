import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { BottomTabBar } from '../components/common/BottomTabBar.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const OrganizerEventsScreen = () => {
  const router = useRouter();
  const { events, currentUser } = useApp();

  // Organizer events
  const organizerEvents = useMemo(() => {
    return events.filter(
      (e) => e.organizerId === currentUser.id || currentUser.role === 'organizer'
    );
  }, [events, currentUser]);

  // Overall KPIs
  const totalStats = useMemo(() => {
    let revenue = 0;
    let sold = 0;
    let totalCap = 0;
    organizerEvents.forEach((e) => {
      e.tiers?.forEach((t) => {
        sold += t.soldCount || 0;
        totalCap += t.totalQuota || 0;
        revenue += (t.soldCount || 0) * (t.price || 0);
      });
    });
    return { revenue, sold, totalCap };
  }, [organizerEvents]);

  const renderEventItem = ({ item }) => {
    let eventSold = 0;
    let eventTotalQuota = 0;
    let eventRevenue = 0;

    item.tiers?.forEach((t) => {
      eventSold += t.soldCount || 0;
      eventTotalQuota += t.totalQuota || 0;
      eventRevenue += (t.soldCount || 0) * (t.price || 0);
    });

    const percent = eventTotalQuota > 0 ? Math.round((eventSold / eventTotalQuota) * 100) : 0;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Gestionar evento ${item.name}`}
        onPress={() => router.push(`/(organizer)/event/${item.id}`)}
        style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeaderRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.eventThumb} />
          <View style={styles.eventTitleCol}>
            <View style={styles.badgeStatusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {item.status === 'active' ? 'En Venta' : 'Cerrado'}
                </Text>
              </View>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.eventName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.eventDate}>📅 {item.displayDate || item.date}</Text>
          </View>
        </View>

        {/* KPIs row for this event */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Entradas Vendidas</Text>
            <Text style={styles.kpiValue}>
              {eventSold} / {eventTotalQuota} ({percent}%)
            </Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Recaudación Acumulada</Text>
            <Text style={styles.kpiValuePrice}>${eventRevenue.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(percent, 100)}%` }]} />
        </View>

        {/* Bottom card CTA */}
        <View style={styles.cardActionRow}>
          <Text style={styles.actionPrompt}>Ver desglose de ventas & compradores</Text>
          <Text style={styles.actionArrow}>→</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <Header subtitle="Panel del Organizador" />

      <FlatList
        data={organizerEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Organizer Profile & Overall KPIs */}
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <View>
                  <Text style={styles.welcomeLabel}>Panel Oficial</Text>
                  <Text style={styles.orgNameTitle}>{currentUser.name}</Text>
                </View>
                <View style={styles.reputationPill}>
                  <Text style={styles.repStar}>★</Text>
                  <Text style={styles.repScore}>4.9</Text>
                  <Text style={styles.repLabel}>Excelente</Text>
                </View>
              </View>

              {/* Mini KPI Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>${totalStats.revenue.toLocaleString('es-AR')}</Text>
                  <Text style={styles.metricLbl}>Recaudación Total</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricVal}>
                    {totalStats.sold} / {totalStats.totalCap}
                  </Text>
                  <Text style={styles.metricLbl}>Entradas Totales</Text>
                </View>
              </View>

              {/* Prominent Create Event CTA */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Crear y publicar nuevo evento"
                onPress={() => router.push('/(organizer)/create')}
                style={({ pressed }) => [styles.createBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.createBtnIcon}>＋</Text>
                <Text style={styles.createBtnText}>Crear Nuevo Evento</Text>
              </Pressable>
            </View>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Tus Eventos Publicados</Text>
              <Text style={styles.eventsCount}>{organizerEvents.length} eventos</Text>
            </View>
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
  listContainer: {
    paddingBottom: 24,
  },
  headerBlock: {
    padding: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeLabel: {
    color: colors.outline,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  orgNameTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  reputationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  repStar: {
    color: colors.tertiary,
    fontSize: 12,
    marginRight: 3,
  },
  repScore: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 4,
  },
  repLabel: {
    color: colors.onTertiary,
    fontSize: 9,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  metricVal: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  metricLbl: {
    color: colors.outline,
    fontSize: 10,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
  },
  createBtnIcon: {
    color: colors.onTertiary,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  createBtnText: {
    color: colors.onTertiary,
    fontSize: 13,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.85,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  eventsCount: {
    color: colors.outline,
    fontSize: 11,
  },
  eventCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeaderRow: {
    flexDirection: 'row',
  },
  eventThumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  eventTitleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '700',
  },
  categoryText: {
    color: colors.outline,
    fontSize: 10,
  },
  eventName: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  eventDate: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  kpiItem: {
    alignItems: 'flex-start',
  },
  kpiLabel: {
    color: colors.outline,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  kpiValuePrice: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  actionPrompt: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionArrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
export default OrganizerEventsScreen;
