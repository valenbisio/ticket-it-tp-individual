import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

const CATEGORIES = ['Música', 'Teatro'];

export const CreateEventScreen = () => {
  const router = useRouter();
  const { currentUser, loadEvents, showToast } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Música');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [showTime, setShowTime] = useState('21:00');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
  );

  // Dynamic Tiers
  const [tiers, setTiers] = useState([
    { id: 'tier-1', name: 'General', price: '15000', totalQuota: '100', description: 'Acceso campo' },
    { id: 'tier-2', name: 'Platea VIP', price: '28000', totalQuota: '40', description: 'Ubicación preferencial' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated totals
  const totalCapacity = tiers.reduce((acc, t) => acc + (parseInt(t.totalQuota, 10) || 0), 0);
  const potentialRevenue = tiers.reduce(
    (acc, t) => acc + (parseInt(t.price, 10) || 0) * (parseInt(t.totalQuota, 10) || 0),
    0
  );

  const addTier = () => {
    const nextId = `tier-${Date.now()}`;
    setTiers((prev) => [
      ...prev,
      { id: nextId, name: '', price: '', totalQuota: '', description: '' },
    ]);
  };

  const removeTier = (id) => {
    if (tiers.length <= 1) {
      showToast('Debes tener al menos un tipo de entrada', 'warning');
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handlePublish = async () => {
    // Validations
    if (!name.trim()) {
      showToast('Ingresa el nombre del evento', 'warning');
      return;
    }
    if (!venue.trim()) {
      showToast('Ingresa el recinto o lugar del evento', 'warning');
      return;
    }
    if (!venueAddress.trim()) {
      showToast('Ingresa la dirección del evento', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Ingresa una breve descripción', 'warning');
      return;
    }

    const invalidTier = tiers.find(
      (t) => !t.name.trim() || !(parseInt(t.price, 10) > 0) || !(parseInt(t.totalQuota, 10) > 0)
    );
    if (invalidTier) {
      showToast('Revisa los tipos de entrada: nombre, precio y cupo son obligatorios', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const newEventData = {
        name: name.trim(),
        category,
        description: description.trim(),
        date,
        displayDate: date,
        showTime,
        venue: venue.trim(),
        venueAddress: venueAddress.trim(),
        imageUrl: imageUrl.trim(),
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        tiers: tiers.map((t) => ({
          id: t.id,
          name: t.name.trim(),
          description: t.description?.trim() || t.name.trim(),
          price: parseInt(t.price, 10),
          totalQuota: parseInt(t.totalQuota, 10),
          soldCount: 0,
        })),
      };

      await api.createEvent(newEventData);
      await loadEvents();
      showToast('¡Evento publicado con éxito en el catálogo!', 'success');
      router.replace('/(organizer)/events');
    } catch (error) {
      showToast(error.message || 'Error al publicar el evento', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Crear Evento" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Nuevo Espectáculo en Vivo</Text>
          <Text style={styles.introSubtitle}>
            Configura los datos del evento, tipos de entrada y cupos disponibles para venta inmediata.
          </Text>
        </View>

        {/* Section 1: General Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>1. Datos Generales</Text>

          <Text style={styles.inputLabel}>Nombre del Evento *</Text>
          <TextInput
            placeholder="Ej: Festival Primavera 2025"
            placeholderTextColor={colors.outline}
            value={name}
            onChangeText={setName}
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryPill, category === cat && styles.activeCategoryPill]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    category === cat && styles.activeCategoryPillText,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Descripción del Evento *</Text>
          <TextInput
            placeholder="Describe la propuesta musical, artística o temática..."
            placeholderTextColor={colors.outline}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[styles.textInput, styles.textArea]}
          />

          <View style={styles.rowTwo}>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Fecha (AAAA-MM-DD)</Text>
              <TextInput
                placeholder="2025-11-20"
                placeholderTextColor={colors.outline}
                value={date}
                onChangeText={setDate}
                style={styles.textInput}
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Hora de Inicio</Text>
              <TextInput
                placeholder="21:00 hs"
                placeholderTextColor={colors.outline}
                value={showTime}
                onChangeText={setShowTime}
                style={styles.textInput}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Lugar / Recinto *</Text>
          <TextInput
            placeholder="Ej: Estadio Movistar Arena / Niceto Club"
            placeholderTextColor={colors.outline}
            value={venue}
            onChangeText={setVenue}
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>Dirección *</Text>
          <TextInput
            placeholder="Ej: Humboldt 450, Villa Crespo, CABA"
            placeholderTextColor={colors.outline}
            value={venueAddress}
            onChangeText={setVenueAddress}
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>URL de Imagen de Portada</Text>
          <TextInput
            placeholder="https://..."
            placeholderTextColor={colors.outline}
            value={imageUrl}
            onChangeText={setImageUrl}
            style={styles.textInput}
          />
        </View>

        {/* Section 2: Dynamic Tiers */}
        <View style={styles.sectionCard}>
          <View style={styles.tierSectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>2. Tipos de Entrada y Cupos</Text>
              <Text style={styles.sectionSub}>Define precios, descripciones y disponibilidad</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agregar tipo de entrada"
              onPress={addTier}
              style={styles.addTierBtn}
            >
              <Text style={styles.addTierText}>＋ Agregar Tipo</Text>
            </Pressable>
          </View>

          <View style={styles.tiersList}>
            {tiers.map((tier, index) => (
              <View key={tier.id} style={styles.tierFormCard}>
                <View style={styles.tierCardHeader}>
                  <Text style={styles.tierIndexBadge}>#{index + 1}</Text>
                  {tiers.length > 1 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Eliminar este tipo de entrada"
                      onPress={() => removeTier(tier.id)}
                      style={styles.deleteTierBtn}
                    >
                      <Text style={styles.deleteTierText}>Eliminar ✕</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.inputLabelSmall}>Nombre del Tipo (Ej: General, VIP, Platea) *</Text>
                <TextInput
                  placeholder="Nombre de la entrada"
                  placeholderTextColor={colors.outline}
                  value={tier.name}
                  onChangeText={(val) => updateTier(tier.id, 'name', val)}
                  style={styles.textInputSmall}
                />

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabelSmall}>Precio ($) *</Text>
                    <TextInput
                      placeholder="18000"
                      placeholderTextColor={colors.outline}
                      keyboardType="numeric"
                      value={tier.price}
                      onChangeText={(val) => updateTier(tier.id, 'price', val)}
                      style={styles.textInputSmall}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabelSmall}>Cupo Total *</Text>
                    <TextInput
                      placeholder="100"
                      placeholderTextColor={colors.outline}
                      keyboardType="numeric"
                      value={tier.totalQuota}
                      onChangeText={(val) => updateTier(tier.id, 'totalQuota', val)}
                      style={styles.textInputSmall}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabelSmall}>Beneficios o Descripción</Text>
                <TextInput
                  placeholder="Ej: Acceso preferencial Puerta 2"
                  placeholderTextColor={colors.outline}
                  value={tier.description}
                  onChangeText={(val) => updateTier(tier.id, 'description', val)}
                  style={styles.textInputSmall}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: Summary Projection */}
        <View style={styles.projectionCard}>
          <Text style={styles.projTitle}>Proyección Financiera y Aforo</Text>
          <View style={styles.projRow}>
            <View style={styles.projCol}>
              <Text style={styles.projLbl}>Aforo Total</Text>
              <Text style={styles.projVal}>{totalCapacity} entradas</Text>
            </View>
            <View style={styles.projCol}>
              <Text style={styles.projLbl}>Recaudación Potencial</Text>
              <Text style={styles.projValPrice}>${potentialRevenue.toLocaleString('es-AR')}</Text>
            </View>
          </View>
        </View>

        {/* Publish Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Publicar evento en catálogo"
          disabled={isSubmitting}
          onPress={handlePublish}
          style={({ pressed }) => [
            styles.publishButton,
            isSubmitting && styles.publishButtonDisabled,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.publishButtonText}>
            {isSubmitting ? 'Publicando...' : 'Publicar Evento en Catálogo'}
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
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  introTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  introSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  sectionHeader: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  sectionSub: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  inputLabel: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  inputLabelSmall: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.onSurface,
    fontSize: 13,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  textInputSmall: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.onSurface,
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
    marginRight: 6,
  },
  activeCategoryPill: {
    backgroundColor: colors.tertiaryContainer,
  },
  categoryPillText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
  },
  activeCategoryPillText: {
    color: colors.onTertiary,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfCol: {
    flex: 1,
  },
  tierSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addTierBtn: {
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  addTierText: {
    color: colors.onTertiary,
    fontSize: 11,
    fontWeight: '800',
  },
  tiersList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tierFormCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierIndexBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  deleteTierBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteTierText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  projectionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  projTitle: {
    color: colors.outline,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  projRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  projCol: {
    alignItems: 'flex-start',
  },
  projLbl: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  projVal: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  projValPrice: {
    color: colors.tertiary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  publishButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.85,
  },
});
export default CreateEventScreen;
