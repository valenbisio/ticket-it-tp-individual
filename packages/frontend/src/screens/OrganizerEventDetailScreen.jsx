import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';
import { PurchaseListSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const OrganizerEventDetailScreen = () => {
  const { id } = useLocalSearchParams(); // eventId
  const router = useRouter();
  const { events, markPurchaseUsed, confirmPurchase, showToast } = useApp();

  const event = useMemo(() => {
    return events.find((e) => e.id === id) || events[0];
  }, [events, id]);

  const [attendees, setAttendees] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [purchaseActionId, setPurchaseActionId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todas');
  const [eventReviews, setEventReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const loadAttendees = useCallback(async () => {
    if (!event) return;
    setAttendeesLoading(true);
    setRequestError('');
    try {
      const result = await api.getEventPurchases(event.id);
      setAttendees(result.purchases);
      setTiers(result.tiers);
    } catch (error) {
      setRequestError(error.message || 'No se pudieron cargar las compras.');
    } finally {
      setAttendeesLoading(false);
    }
  }, [event]);

  useEffect(() => {
    void loadAttendees();
  }, [loadAttendees]);

  useEffect(() => {
    if (!event) return;
    let activo = true;
    setReviewsLoading(true);
    setReviewsError('');
    api.getReviews(event.id).then((items) => {
      if (activo) setEventReviews(items);
    }).catch((error) => {
      if (activo) setReviewsError(error.message || 'No se pudieron cargar las opiniones.');
    }).finally(() => {
      if (activo) setReviewsLoading(false);
    });
    return () => { activo = false; };
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
  tiers.forEach((t) => {
    totalSold += t.soldCount || 0;
    totalQuota += t.totalQuota || 0;
    totalRevenue += t.revenue ?? (t.soldCount || 0) * (t.price || 0);
  });
  const occupancyPercent = totalQuota > 0 ? Math.round((totalSold / totalQuota) * 100) : 0;

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    if (filterStatus === 'todas') return true;
    return a.status === filterStatus;
  });

  const handleValidateEntry = async (purchaseId) => {
    try {
      setPurchaseActionId(purchaseId);
      await markPurchaseUsed(purchaseId);
      showToast('Pase validado exitosamente en molinete', 'success');
      await loadAttendees();
    } catch (error) {
      showToast(error.message || 'No se pudo validar el pase', 'error');
    } finally {
      setPurchaseActionId(null);
    }
  };

  const handleConfirmPayment = async (purchaseId) => {
    try {
      setPurchaseActionId(purchaseId);
      await confirmPurchase(purchaseId);
      await loadAttendees();
    } catch (error) {
      showToast(error.message || 'No se pudo confirmar el pago', 'error');
    } finally {
      setPurchaseActionId(null);
    }
  };

  const selectFilter = (status) => {
    setFilterStatus(status);
    setFilterLoading(true);
    setTimeout(() => setFilterLoading(false), 240);
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
            <View style={styles.heroMetaRow}>
              <Ionicons name="calendar" size={14} color={colors.tertiary} />
              <Text style={styles.eventDate}>{event.displayDate || event.date}</Text>
            </View>
            <View style={styles.heroMetaRow}>
              <Ionicons name="location-sharp" size={14} color={colors.secondary} />
              <Text style={styles.eventVenue}>{event.venue}</Text>
            </View>
          </View>
        </View>

        {/* Global Sales Summary (Dual Metric Grid) */}
        {attendeesLoading ? <ActivityIndicator accessibilityLabel="Cargando métricas de ventas" color={colors.primary} /> : <View style={styles.metricsRow}>
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
        </View>}

        {/* Desglose por Tipo de Entrada (Tiers) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Desglose por Tipo de Entrada</Text>
          <Text style={styles.sectionSub}>Cupos vendidos, disponibles y recaudación parcial</Text>

          {attendeesLoading ? <PurchaseListSkeleton /> : <View style={styles.tiersContainer}>
            {tiers.map((tier) => {
              const remaining = tier.availableQuota ?? (tier.totalQuota - tier.soldCount);
              const tierRevenue = tier.revenue ?? (tier.soldCount * tier.price);
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
          </View>}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Opiniones de este evento</Text>
          {reviewsLoading ? <ActivityIndicator accessibilityLabel="Cargando opiniones" color={colors.primary} /> : reviewsError ? (
            <Text accessibilityRole="alert" style={styles.requestError}>{reviewsError}</Text>
          ) : eventReviews.length === 0 ? (
            <Text style={styles.sectionSub}>Todavía no hay opiniones para este evento.</Text>
          ) : eventReviews.map((review, index) => (
            <View key={`${review.usuarioId || 'asistente'}-${index}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.buyerName || 'Comprador'}</Text>
                <Text accessibilityLabel={`${review.rating} de 5 estrellas`} style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
              </View>
              {!!review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
            </View>
          ))}
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
            {['todas', 'pendiente de pago', 'confirmada', 'utilizada', 'cancelada', 'reembolsada'].map((st) => (
              <Pressable
                key={st}
                accessibilityRole="tab"
                accessibilityState={{ selected: filterStatus === st }}
                onPress={() => selectFilter(st)}
                style={[styles.attendeeFilterPill, filterStatus === st && styles.activeFilterPill]}
              >
                <Text
                  style={[
                    styles.attendeeFilterText,
                    filterStatus === st && styles.activeFilterText,
                  ]}
                >
                  {st === 'todas' ? 'Todas' : st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Attendees List */}
          <View style={styles.attendeesList}>
            {!!requestError && <Text accessibilityRole="alert" style={styles.requestError}>{requestError}</Text>}
          {attendeesLoading || filterLoading ? <PurchaseListSkeleton /> : requestError ? null : filteredAttendees.length === 0 ? (
              <View style={styles.emptyAttendees}>
                <Text style={styles.emptyAttText}>No hay compras con este filtro</Text>
              </View>
            ) : (
              filteredAttendees.map((att) => {
                const canCheckIn = att.status === 'confirmada';
                const isPending = att.status === 'pendiente de pago';
                const isUsed = att.status === 'utilizada';
                const isBusy = purchaseActionId === att.id;

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
                        accessibilityHint={`Abre el chat de la compra de ${att.tierName}`}
                        onPress={() => router.push(`/chat/${att.id}`)}
                        style={styles.attChatBtn}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.onSurface} style={styles.actionBtnIcon} />
                        <Text style={styles.attChatText}>Chat</Text>
                      </Pressable>

                      {isPending ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Confirmar pago de ${att.tierName} para ${att.buyerName}`}
                          accessibilityHint="Confirma esta compra pendiente y habilita el check-in"
                          accessibilityState={{ disabled: isBusy, busy: isBusy }}
                          disabled={isBusy}
                          onPress={() => handleConfirmPayment(att.id)}
                          style={[styles.attActionBtn, isBusy && styles.attActionBtnDisabled]}
                        >
                          {isBusy ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <Ionicons name="card-outline" size={16} color={colors.onPrimary} style={styles.actionBtnIcon} />}
                          <Text style={styles.attCheckInText}>{isBusy ? 'Confirmando…' : 'Confirmar pago'}</Text>
                        </Pressable>
                      ) : canCheckIn ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Validar entrada de ${att.buyerName}`}
                          accessibilityHint="Marca la entrada como utilizada al realizar el check-in"
                          accessibilityState={{ disabled: isBusy, busy: isBusy }}
                          disabled={isBusy}
                          onPress={() => handleValidateEntry(att.id)}
                          style={[styles.attActionBtn, isBusy && styles.attActionBtnDisabled]}
                        >
                          {isBusy ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <Ionicons name="checkmark-circle-outline" size={16} color={colors.onPrimary} style={styles.actionBtnIcon} />}
                          <Text style={styles.attCheckInText}>{isBusy ? 'Validando…' : 'Validar Entrada (Check-in)'}</Text>
                        </Pressable>
                      ) : isUsed ? (
                        <View style={styles.attDoneBox}>
                          <Text style={styles.attDoneText}>✓ Entrada utilizada</Text>
                        </View>
                      ) : null}
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
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  actionBtnIcon: {
    marginRight: 4,
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
  requestError: { color: colors.error, marginVertical: spacing.sm },
  reviewCard: { padding: spacing.sm, marginTop: spacing.sm, backgroundColor: colors.surfaceContainerHigh, borderRadius: borderRadius.md },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { color: colors.onSurface, fontWeight: '700' },
  reviewRating: { color: colors.tertiary, fontWeight: '800' },
  reviewComment: { color: colors.onSurfaceVariant, marginTop: spacing.xs, lineHeight: 20 },
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
    minHeight: 44,
    paddingVertical: 8,
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
  attActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    minHeight: 44,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  attActionBtnDisabled: {
    opacity: 0.65,
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
