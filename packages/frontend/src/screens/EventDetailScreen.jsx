import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { useReviews } from '../hooks/useReviews.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const EventDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { events, buyTicket, favorites, toggleFavorite, showToast } = useApp();

  const event = useMemo(() => {
    return events.find((e) => e.id === id) || events[0];
  }, [events, id]);

  const [selectedTierId, setSelectedTierId] = useState(
    event?.tiers?.[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedPurchase, setConfirmedPurchase] = useState(null);
  const { reviews } = useReviews(event?.id);

  if (!event) {
    return (
      <View style={styles.notFoundCenter}>
        <Text style={styles.notFoundText}>Evento no encontrado</Text>
      </View>
    );
  }

  const selectedTier = event.tiers?.find((t) => t.id === selectedTierId) || event.tiers?.[0];
  const availableQuota = selectedTier ? selectedTier.totalQuota - selectedTier.soldCount : 0;
  const totalPrice = (selectedTier?.price || 0) * quantity;
  const isSoldOut = availableQuota <= 0;
  const isFav = favorites.includes(event.id);

  const handlePurchase = async () => {
    if (isSoldOut) {
      showToast('Este tipo de entrada se encuentra agotado', 'warning');
      return;
    }
    try {
      setIsSubmitting(true);
      const purchase = await buyTicket({
        eventId: event.id,
        tierId: selectedTier.id,
        quantity,
      });
      setConfirmedPurchase(purchase);
    } catch {
      showToast('Error al procesar la compra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Detalle del Evento" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroBox}>
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          <View style={styles.heroTopActions}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Favorito"
              onPress={() => toggleFavorite(event.id)}
              style={styles.heroFavBtn}
            >
              <Text style={styles.heroFavIcon}>{isFav ? '❤️' : '🤍'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Event Title & Meta */}
        <View style={styles.bodyContent}>
          <Text style={styles.eventTitle}>{event.name}</Text>

          {/* Date & Location Bento */}
          <View style={styles.infoBento}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View>
                <Text style={styles.infoTitle}>{event.displayDate || event.date}</Text>
                <Text style={styles.infoSubtitle}>
                  Apertura: {event.doorTime || '18:00'} • Inicio: {event.showTime || '20:00'}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                <Text style={styles.infoTitle}>{event.venue}</Text>
                <Text style={styles.infoSubtitle}>{event.venueAddress || 'CABA'}</Text>
              </View>
            </View>
          </View>

          {/* Organizer Card with Rating */}
          <View style={styles.organizerBox}>
            <View style={styles.organizerLeft}>
              <View style={styles.orgAvatar}>
                <Text style={styles.orgAvatarText}>🎭</Text>
              </View>
              <View>
                <Text style={styles.orgLabel}>Organizado por</Text>
                <Text style={styles.orgName}>{event.organizerName}</Text>
              </View>
            </View>
            <View style={styles.orgRatingPill}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingScore}>{event.organizerRating}</Text>
              <Text style={styles.reviewsCount}>({event.organizerReviewsCount || 45})</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Acerca del evento</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          {/* Lineup / Artists if any */}
          {event.lineup && event.lineup.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Lineup & Artistas</Text>
              <View style={styles.lineupGrid}>
                {event.lineup.map((art, idx) => (
                  <View key={idx} style={styles.lineupCard}>
                    <Image source={{ uri: art.image }} style={styles.artImage} />
                    <Text style={styles.artName} numberOfLines={1}>
                      {art.name}
                    </Text>
                    <Text style={styles.artRole} numberOfLines={1}>
                      {art.time || art.role}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reseñas del organizador */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Reseñas del organizador</Text>
            <Text style={styles.sectionSubheading}>
              Experiencias de asistentes a eventos anteriores de {event.organizerName}
            </Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>Este organizador todavía no tiene reseñas.</Text>
            ) : (
              reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <Image source={{ uri: rev.buyerAvatar }} style={styles.reviewAvatar} />
                    <View style={styles.reviewUserCol}>
                      <Text style={styles.reviewUserName}>{rev.buyerName}</Text>
                      <Text style={styles.reviewMeta} numberOfLines={1}>
                        {rev.eventName} • {rev.date}
                      </Text>
                    </View>
                    <Text style={styles.reviewStars}>
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            )}
          </View>

          {/* TIER SELECTION (Tipos de entrada, precio y cupo) */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Selecciona tu entrada</Text>
            <Text style={styles.sectionSubheading}>
              Cupos asegurados con tecnología de validación dinámica
            </Text>

            <View style={styles.tiersList}>
              {event.tiers?.map((tier) => {
                const remaining = tier.totalQuota - tier.soldCount;
                const isTierSoldOut = remaining <= 0;
                const isSelected = selectedTierId === tier.id;

                return (
                  <Pressable
                    key={tier.id}
                    disabled={isTierSoldOut}
                    onPress={() => {
                      setSelectedTierId(tier.id);
                      setQuantity(1);
                    }}
                    style={[
                      styles.tierCard,
                      isSelected && styles.selectedTierCard,
                      isTierSoldOut && styles.soldOutTierCard,
                    ]}
                  >
                    <View style={styles.tierTopRow}>
                      <View style={styles.tierNameCol}>
                        <Text style={styles.tierName}>{tier.name}</Text>
                        <Text style={styles.tierDesc}>{tier.description}</Text>
                      </View>
                      <Text style={styles.tierPrice}>${tier.price.toLocaleString('es-AR')}</Text>
                    </View>

                    <View style={styles.tierBottomRow}>
                      <View
                        style={[
                          styles.quotaBadge,
                          isTierSoldOut ? styles.soldOutBadge : styles.availableBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quotaBadgeText,
                            isTierSoldOut ? styles.soldOutBadgeText : styles.availableBadgeText,
                          ]}
                        >
                          {isTierSoldOut ? 'AGOTADO' : `${remaining} disponibles`}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedMarker}>
                          <Text style={styles.selectedMarkerText}>✓ Seleccionado</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Quantity Selector */}
          {!isSoldOut && (
            <View style={styles.quantityCard}>
              <View>
                <Text style={styles.quantityTitle}>Cantidad de entradas</Text>
                <Text style={styles.quantityLimit}>Disponibles: {availableQuota}</Text>
              </View>
              <View style={styles.stepperRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Disminuir cantidad"
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={[styles.stepperBtn, quantity <= 1 && styles.stepperDisabled]}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>
                <Text style={styles.quantityNumber}>{quantity}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar cantidad"
                  onPress={() => setQuantity((q) => Math.min(availableQuota, q + 1))}
                  style={[
                    styles.stepperBtn,
                    quantity >= availableQuota && styles.stepperDisabled,
                  ]}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Bar with Total Calculation */}
      <View style={styles.checkoutBar}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Total a pagar ({quantity} entrada{quantity > 1 ? 's' : ''}):</Text>
          <Text style={styles.totalAmount}>${totalPrice.toLocaleString('es-AR')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Comprar entradas por total de $${totalPrice}`}
          disabled={isSoldOut || isSubmitting}
          onPress={handlePurchase}
          style={({ pressed }) => [
            styles.buyButton,
            isSoldOut && styles.buyButtonDisabled,
            pressed && styles.buyButtonPressed,
          ]}
        >
          <Text style={styles.buyButtonText}>
            {isSubmitting ? 'Procesando...' : isSoldOut ? 'Agotado' : 'Comprar Entrada'}
          </Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}
      {confirmedPurchase && (
        <Modal transparent animationType="slide" visible={Boolean(confirmedPurchase)}>
          <View style={styles.modalOverlay}>
            <View style={styles.successModalCard}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successCheck}>✓</Text>
              </View>
              <Text style={styles.successTitle}>¡Compra registrada!</Text>
              <Text style={styles.successSubtitle}>
                La compra quedó pendiente de pago. Podés consultar su estado desde &quot;Mis compras&quot;.
              </Text>

              <View style={styles.ticketSummaryBox}>
                <Text style={styles.summaryEvent}>{confirmedPurchase.eventName}</Text>
                <Text style={styles.summaryDetails}>
                  {confirmedPurchase.tierName} • {confirmedPurchase.quantity} entrada(s)
                </Text>
                <Text style={styles.summaryTotal}>
                  Total: ${confirmedPurchase.totalPrice?.toLocaleString('es-AR')}
                </Text>
                <Text style={styles.summaryCode}>Código: {confirmedPurchase.id}</Text>
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setConfirmedPurchase(null);
                    router.push('/(buyer)/purchases');
                  }}
                  style={styles.goToPurchasesBtn}
                >
                  <Text style={styles.goToPurchasesText}>Ver en Mis Compras</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setConfirmedPurchase(null);
                    router.push('/(buyer)/explore');
                  }}
                  style={styles.keepExploringBtn}
                >
                  <Text style={styles.keepExploringText}>Seguir explorando</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  notFoundCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.onSurface,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBox: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceContainerLowest,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(11, 19, 38, 0.7)',
  },
  heroTopActions: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(11, 19, 38, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroFavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(11, 19, 38, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFavIcon: {
    fontSize: 16,
  },
  bodyContent: {
    padding: spacing.md,
  },
  eventTitle: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  infoBento: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoTitle: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  infoSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  organizerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  organizerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orgAvatarText: {
    fontSize: 18,
  },
  orgLabel: {
    color: colors.outline,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  orgName: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  orgRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  star: {
    color: colors.tertiary,
    fontSize: 12,
    marginRight: 2,
  },
  ratingScore: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsCount: {
    color: colors.outline,
    fontSize: 10,
    marginLeft: 3,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubheading: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },
  noReviewsText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHighest,
    marginRight: spacing.sm,
  },
  reviewUserCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  reviewUserName: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewMeta: {
    color: colors.outline,
    fontSize: 10,
    marginTop: 1,
  },
  reviewStars: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewComment: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },
  lineupGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  lineupCard: {
    width: 100,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: 6,
    alignItems: 'center',
  },
  artImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  artName: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  artRole: {
    color: colors.outline,
    fontSize: 9,
  },
  tiersList: {
    gap: spacing.sm,
  },
  tierCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTierCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  soldOutTierCard: {
    opacity: 0.5,
  },
  tierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tierNameCol: {
    flex: 1,
    paddingRight: 12,
  },
  tierName: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  tierDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  tierPrice: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  tierBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quotaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  availableBadge: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
  },
  availableBadgeText: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  soldOutBadge: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  soldOutBadgeText: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '700',
  },
  selectedMarker: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  selectedMarkerText: {
    color: colors.onPrimaryContainer,
    fontSize: 10,
    fontWeight: '800',
  },
  quantityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  quantityTitle: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  quantityLimit: {
    color: colors.outline,
    fontSize: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityNumber: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBlock: {
    flex: 1,
  },
  totalLabel: {
    color: colors.outline,
    fontSize: 11,
  },
  totalAmount: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  buyButtonPressed: {
    opacity: 0.8,
  },
  buyButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  buyButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 14, 32, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.successContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successCheck: {
    color: colors.success,
    fontSize: 32,
    fontWeight: 'bold',
  },
  successTitle: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '800',
  },
  successSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  ticketSummaryBox: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  summaryEvent: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
  summaryDetails: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  summaryTotal: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryCode: {
    color: colors.outline,
    fontSize: 10,
    marginTop: 2,
  },
  modalActionsRow: {
    width: '100%',
    gap: spacing.sm,
  },
  goToPurchasesBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  goToPurchasesText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  keepExploringBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  keepExploringText: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
});
export default EventDetailScreen;
