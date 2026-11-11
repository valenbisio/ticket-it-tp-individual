import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const OrganizerEventDetailScreen = () => {
  const { id } = useLocalSearchParams(); // eventId
  const router = useRouter();
  const { events, markPurchaseUsed, showToast } = useApp();

  const event = useMemo(() => {
    return events.find((e) => e.id === id) || events[0];
  }, [events, id]);

  const [attendees, setAttendees] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todas');

  const loadAttendees = async () => {
    if (!event) return;
    const list = await api.getEventPurchases(event.id);
    setAttendees(list);
  };

  useEffect(() => {
    loadAttendees();
  }, [event]);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Evento no encontrado</Text>
      </View>
    );
  }

  // Calculate overall metrics
  let totalSold = 0;
  let totalQuota = 0;
  let totalRevenue = 0;
  event.tiers?.forEach((t) => {
    totalSold += t.soldCount || 0;
    totalQuota += t.totalQuota || 0;
    totalRevenue += (t.soldCount || 0) * (t.price || 0);
  });
  const occupancyPercent = totalQuota > 0 ? Math.round((totalSold / totalQuota) * 100) : 0;

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    if (filterStatus === 'todas') return true;
    return a.status === filterStatus;
  });

  const handleValidateEntry = async (purchaseId) => {
    await markPurchaseUsed(purchaseId);
    showToast(`Pase validado exitosamente en molinete`, 'success');
    loadAttendees();
  };

  return (
    <View style={styles.screen}>
      <Header title="Gestión de Evento" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event Header Hero */}
        <View style={styles.heroCard}>
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroDetails}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDate}>📅 {event.displayDate || event.date}</Text>
            <Text style={styles.eventVenue}>📍 {event.venue}</Text>
          </View>
        </View>

        {/* Global Sales Summary (Dual Metric Grid) */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Recaudado</Text>
            <Text style={styles.metricValuePrice}>${totalRevenue.toLocaleString('es-AR')}</Text>
            <Text style={styles.metricSub}>Facturación actual</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ocupación / Aforo</Text>
            <Text style={styles.metricValue}>
              {occupancyPercent}% ({totalSold}/{totalQuota})
            </Text>
            <View style={styles.miniProgressBg}>
              <View
                style={[styles.miniProgressFill, { width: `${Math.min(occupancyPercent, 100)}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Desglose por Tipo de Entrada (Tiers) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Desglose por Tipo de Entrada</Text>
          <Text style={styles.sectionSub}>Cupos vendidos, disponibles y recaudación parcial</Text>

          <View style={styles.tiersContainer}>
            {event.tiers?.map((tier) => {
              const remaining = tier.totalQuota - tier.soldCount;
              const tierRevenue = tier.soldCount * tier.price;
              const tierPercent =
                tier.totalQuota > 0 ? Math.round((tier.soldCount / tier.totalQuota) * 100) : 0;

              return (
                <View key={tier.id} style={styles.tierDetailCard}>
                  <View style={styles.tierTop}>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierPrice}>${tier.price.toLocaleString('es-AR')}</Text>
                  </View>

                  <View style={styles.tierProgressBg}>
                    <View
                      style={[
                        styles.tierProgressFill,
                        { width: `${Math.min(tierPercent, 100)}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.tierStatsGrid}>
                    <View style={styles.tierStatCol}>
                      <Text style={styles.statLbl}>Vendidas</Text>
                      <Text style={styles.statVal}>{tier.soldCount}</Text>
                    </View>
                    <View style={styles.tierStatCol}>
                      <Text style={styles.statLbl}>Disponibles</Text>
                      <Text style={[styles.statVal, { color: colors.tertiary }]}>{remaining}</Text>
                    </View>
                    <View style={styles.tierStatCol}>
                      <Text style={styles.statLbl}>Subtotal</Text>
                      <Text style={[styles.statVal, { color: colors.primary }]}>
                        ${tierRevenue.toLocaleString('es-AR')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Lista de Compras Asociadas al Evento */}
        <View style={styles.sectionBlock}>
          <View style={styles.attendeesHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Asistentes y Compras</Text>
              <Text style={styles.sectionSub}>
                {filteredAttendees.length} registro(s) para control de acceso
              </Text>
            </View>
          </View>

          {/* Filter tabs */}
          <View style={styles.attendeeFilters}>
            {['todas', 'confirmada', 'utilizada'].map((st) => (
              <Pressable
                key={st}
                onPress={() => setFilterStatus(st)}
                style={[styles.attendeeFilterPill, filterStatus === st && styles.activeFilterPill]}
              >
                <Text
                  style={[
                    styles.attendeeFilterText,
                    filterStatus === st && styles.activeFilterText,
                  ]}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Attendees List */}
          <View style={styles.attendeesList}>
            {filteredAttendees.length === 0 ? (
              <View style={styles.emptyAttendees}>
                <Text style={styles.emptyAttText}>No hay compras con este filtro</Text>
              </View>
            ) : (
              filteredAttendees.map((att) => {
                const canCheckIn = att.status === 'confirmada';

                return (
                  <View key={att.id} style={styles.attendeeCard}>
                    <View style={styles.attHeaderRow}>
                      <View style={styles.attUserCol}>
                        <Text style={styles.attUserName}>{att.buyerName}</Text>
                        <Text style={styles.attTicketDetails}>
                          {att.tierName} × {att.quantity} entrada(s) • #{att.id}
                        </Text>
                      </View>
                      <StatusBadge status={att.status} />
                    </View>

                    {att.checkedInAt && (
                      <Text style={styles.checkedInStamp}>✓ Ingresó: {att.checkedInAt}</Text>
                    )}

                    {/* Action buttons: Chat & Check-in */}
                    <View style={styles.attActionsRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Abrir chat con ${att.buyerName}`}
                        onPress={() => router.push(`/(buyer)/chat/${att.id}`)}
                        style={styles.attChatBtn}
                      >
                        <Text style={styles.attChatIcon}>💬</Text>
                        <Text style={styles.attChatText}>Chat</Text>
                      </Pressable>

                      {canCheckIn ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Validar entrada de ${att.buyerName}`}
                          onPress={() => handleValidateEntry(att.id)}
                          style={styles.attCheckInBtn}
                        >
                          <Text style={styles.attCheckInIcon}>🎟️</Text>
                          <Text style={styles.attCheckInText}>Validar Entrada (Check-in)</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.attDoneBox}>
                          <Text style={styles.attDoneText}>✓ Validada</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    color: colors.onSurface,
    fontSize: 16,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  heroCard: {
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainerLowest,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(11, 19, 38, 0.75)',
  },
  heroDetails: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  eventName: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
  },
  eventDate: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  eventVenue: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  metricLabel: {
    color: colors.outline,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metricValuePrice: {
    color: colors.tertiary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 4,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  sectionBlock: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  sectionHeading: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  tiersContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tierDetailCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierName: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  tierPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  tierProgressBg: {
    height: 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
  },
  tierStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierStatCol: {
    alignItems: 'center',
  },
  statLbl: {
    color: colors.outline,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  statVal: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  attendeesHeaderRow: {
    marginBottom: spacing.sm,
  },
  attendeeFilters: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  attendeeFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  activeFilterPill: {
    backgroundColor: colors.tertiaryContainer,
  },
  attendeeFilterText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.onTertiary,
  },
  attendeesList: {
    gap: spacing.sm,
  },
  emptyAttendees: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyAttText: {
    color: colors.outline,
    fontSize: 12,
  },
  attendeeCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  attHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  attUserCol: {
    flex: 1,
    paddingRight: 8,
  },
  attUserName: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  attTicketDetails: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  checkedInStamp: {
    color: colors.tertiary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  attActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  attChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  attChatIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  attChatText: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  attCheckInBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  attCheckInIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  attCheckInText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  attDoneBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
  },
  attDoneText: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '700',
  },
});
export default OrganizerEventDetailScreen;
