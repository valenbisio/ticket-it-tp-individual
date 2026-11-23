import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const RateEventScreen = () => {
  const { id } = useLocalSearchParams(); // purchaseId
  const router = useRouter();
  const { purchases, showToast, currentUser, loadPurchases, markPurchaseRated } = useApp();

  const purchase = useMemo(() => {
    return purchases.find((p) => p.id === id) || null;
  }, [purchases, id]);
  const eventId = purchase?.eventId;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checkingReview, setCheckingReview] = useState(true);

  useEffect(() => {
    let activo = true;
    if (!eventId) { setCheckingReview(false); return () => { activo = false; }; }
    setCheckingReview(true);
    api.getReviews(eventId).then((reviews) => {
      const review = reviews.find((item) => item.usuarioId === currentUser.id);
      if (activo && review) {
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment || '');
      }
    }).catch((error) => {
      if (activo) showToast(error.message || 'No se pudo consultar tu calificación', 'error');
    }).finally(() => { if (activo) setCheckingReview(false); });
    return () => { activo = false; };
  }, [eventId, currentUser.id, showToast]);

  const handleSendRating = async () => {
    if (!purchase) return;
    try {
      setIsSubmitting(true);
      await api.createReview({
        purchaseId: purchase.id,
        eventId: purchase.eventId,
        eventName: purchase.eventName,
        organizerId: purchase.organizerId,
        rating,
        comment: comment.trim(),
      });
      markPurchaseRated(purchase.id);
      setSubmitted(true);
      void loadPurchases().catch((error) => showToast(error.message || 'No se pudo actualizar Mis compras', 'error'));
    } catch (error) {
      showToast(error.message || 'No se pudo enviar la calificación. Probá nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Calificar Evento" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        {checkingReview ? <View accessibilityRole="progressbar" accessibilityLabel="Consultando tu calificación" style={styles.successCard}><ActivityIndicator color={colors.primary} /></View> : existingReview ? (
          <View accessibilityRole="summary" style={styles.successCard}>
            <Text accessibilityRole="header" style={styles.successTitle}>Tu calificación</Text>
            <Text accessibilityLabel={`${existingReview.rating} de 5 estrellas`} style={styles.reviewStars}>{'★'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)}</Text>
            {existingReview.comment ? <Text style={styles.successText}>{existingReview.comment}</Text> : <Text style={styles.successText}>No agregaste un comentario.</Text>}
            <Pressable accessibilityRole="button" onPress={() => router.replace('/(buyer)/purchases')} style={styles.submitButton}><Text style={styles.submitButtonText}>Volver a mis compras</Text></Pressable>
          </View>
        ) : submitted ? (
          <View accessibilityRole="alert" style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>¡Reseña enviada!</Text>
            <Text style={styles.successText}>Gracias por compartir tu experiencia.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/(buyer)/purchases')} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Volver a mis compras</Text>
            </Pressable>
          </View>
        ) : <>
        {purchase && (
          <View style={styles.eventCard}>
            <Text style={styles.eventLabel}>Calificando experiencia de:</Text>
            <Text style={styles.eventName}>{purchase.eventName}</Text>
            <Text style={styles.eventDate}>📅 {purchase.eventDisplayDate || purchase.eventDate}</Text>
            <Text style={styles.orgName}>Organizador: {purchase.organizerName}</Text>
          </View>
        )}

        {/* Stars Selector (1 to 5) */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>¿Cómo estuvo el espectáculo?</Text>
          <Text style={styles.ratingSubtitle}>
            Toca una estrella para definir tu puntaje
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                accessibilityRole="button"
                accessibilityLabel={`Calificar con ${star} estrellas`}
                onPress={() => setRating(star)}
                style={styles.starTouch}
              >
                <Text
                  style={[
                    styles.starIcon,
                    star <= rating ? styles.starFilled : styles.starEmpty,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.ratingScoreLabel}>
            {rating === 5 && '¡Excelente, inolvidable! (5/5)'}
            {rating === 4 && 'Muy bueno, gran show (4/5)'}
            {rating === 3 && 'Bueno, con detalles (3/5)'}
            {rating === 2 && 'Regular, puede mejorar (2/5)'}
            {rating === 1 && 'Mala experiencia (1/5)'}
          </Text>
        </View>

        {/* Comment field */}
        <View style={styles.commentCard}>
          <Text style={styles.commentLabel}>Comentario (opcional)</Text>
          <TextInput
            placeholder="Comparte detalles sobre el sonido, organización, ingreso ágil con QR, etc..."
            placeholderTextColor={colors.outline}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />
        </View>

        {/* Submit button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar calificación del evento"
          disabled={isSubmitting}
          onPress={handleSendRating}
          style={({ pressed }) => [
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
            pressed && styles.btnPressed,
          ]}
        >
          {isSubmitting ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Enviando reseña" /> : <Text style={styles.submitButtonText}>Enviar calificación</Text>}
        </Pressable>
        </>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  eventCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  eventLabel: {
    color: colors.outline,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  eventName: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  eventDate: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  orgName: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 4,
  },
  ratingCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  ratingTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  ratingSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: spacing.md,
  },
  starTouch: {
    padding: 6,
  },
  starIcon: {
    fontSize: 38,
  },
  starFilled: {
    color: colors.tertiary,
  },
  starEmpty: {
    color: colors.surfaceContainerHighest,
  },
  ratingScoreLabel: {
    color: colors.tertiary,
    fontSize: 13,
    fontWeight: '700',
  },
  commentCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  commentLabel: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  commentInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    color: colors.onSurface,
    fontSize: 13,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  successCard: { backgroundColor: colors.surfaceContainerHigh, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  successIcon: { color: colors.success, fontSize: 42, fontWeight: '800' },
  successTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '800' },
  successText: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },
  reviewStars: { color: colors.tertiary, fontSize: 28, fontWeight: '800' },
  btnPressed: {
    opacity: 0.8,
  },
});
export default RateEventScreen;
