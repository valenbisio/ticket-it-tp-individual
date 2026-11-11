import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  const { purchases, currentUser, showToast } = useApp();

  const purchase = useMemo(() => {
    return purchases.find((p) => p.id === id) || purchases[0];
  }, [purchases, id]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendRating = async () => {
    if (!purchase) return;
    try {
      setIsSubmitting(true);
      await api.createReview({
        purchaseId: purchase.id,
        eventId: purchase.eventId,
        eventName: purchase.eventName,
        organizerId: purchase.organizerId,
        buyerName: currentUser.name,
        buyerAvatar: currentUser.avatar,
        rating,
        comment: comment.trim(),
      });
      showToast('¡Gracias por tu reseña! Tu opinión ayuda a la comunidad.', 'success');
      router.replace('/(buyer)/purchases');
    } catch {
      showToast('Error al enviar la calificación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Calificar Evento" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
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
          <Text style={styles.commentLabel}>Comentario</Text>
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
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
          </Text>
        </Pressable>
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
  btnPressed: {
    opacity: 0.8,
  },
});
export default RateEventScreen;
