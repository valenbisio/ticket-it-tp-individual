import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { CategoryScroller } from '../components/common/CategoryScroller.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const CreateEventScreen = () => {
  const router = useRouter();
  const { currentUser, loadEvents, showToast } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Música');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  });
  const [showTime, setShowTime] = useState('21:00');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(`${date}T12:00:00`));
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState('');

  // Dynamic Tiers
  const [tiers, setTiers] = useState([
    { id: 'tier-1', name: 'General', price: '15000', totalQuota: '100', description: 'Acceso campo' },
    { id: 'tier-2', name: 'Platea VIP', price: '28000', totalQuota: '40', description: 'Ubicación preferencial' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const submitLock = useRef(false);
  const formScrollRef = useRef(null);

  useEffect(() => {
    let activo = true;
    api.getCategories().then((items) => {
      if (activo) {
        const names = items.map((item) => item.nombre);
        setCategories(names);
        setCategory((actual) => names.includes(actual) || !names.length ? actual : names[0]);
      }
    }).catch((error) => {
      if (activo) setRequestError(error.message || 'No se pudieron cargar las categorías.');
    }).finally(() => { if (activo) setCategoriesLoading(false); });
    return () => { activo = false; };
  }, []);

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
    setFieldErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${id}.`))));
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
    setFieldErrors((prev) => ({ ...prev, [`${id}.${field}`]: '' }));
  };

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.55, base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset.base64) {
        setRequestError('No se pudo leer la imagen seleccionada. Probá con otra.');
        return;
      }
      if (asset.base64.length > 4_500_000) {
        setRequestError('La imagen ocupa demasiado. Elegí una imagen más pequeña.');
        return;
      }
      setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
      setRequestError('');
    }
  };

  const dateParts = date.split('-').map(Number);
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const monthLabel = calendarMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const minimumDate = new Date();
  minimumDate.setHours(0, 0, 0, 0);

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Ingresá el nombre del evento.';
    if (!description.trim()) errors.description = 'Ingresá una descripción.';
    const eventDate = new Date(`${date}T${showTime}:00`);
    if (!date || Number.isNaN(eventDate.getTime())) errors.date = 'Elegí una fecha y hora válidas.';
    else if (eventDate <= new Date()) errors.date = 'La fecha y hora deben ser futuras.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(showTime)) errors.showTime = 'Usá el formato HH:MM.';
    if (!venue.trim()) errors.venue = 'Ingresá el lugar del evento.';
    if (!venueAddress.trim()) errors.venueAddress = 'Ingresá la dirección del evento.';
    if (!tiers.length) errors.tiers = 'Agregá al menos un tipo de entrada.';
    tiers.forEach((tier) => {
      if (!tier.name.trim()) errors[`${tier.id}.name`] = 'Ingresá un nombre para esta entrada.';
      if (tier.price === '' || !Number.isFinite(Number(tier.price)) || Number(tier.price) < 0) errors[`${tier.id}.price`] = 'El precio debe ser un número igual o mayor a cero.';
      if (!/^\d+$/.test(tier.totalQuota) || Number(tier.totalQuota) < 1) errors[`${tier.id}.totalQuota`] = 'El cupo debe ser un entero mayor que cero.';
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length) AccessibilityInfo.announceForAccessibility('Hay errores en el formulario. Revisá los campos marcados.');
    return Object.keys(errors).length === 0;
  };

  const handlePublish = async () => {
    if (submitLock.current) return;
    if (!validate()) {
      setRequestError('Revisá los campos señalados antes de publicar.');
      formScrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    submitLock.current = true;
    setRequestError('');

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
        imageUrl,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        tiers: tiers.map((t) => ({
          id: t.id,
          name: t.name.trim(),
          description: t.description?.trim() || t.name.trim(),
          price: Number(t.price),
          totalQuota: parseInt(t.totalQuota, 10),
          soldCount: 0,
        })),
      };

      await api.createEvent(newEventData);
      setCreated(true);
      AccessibilityInfo.announceForAccessibility('Evento creado correctamente.');
      void loadEvents().catch((error) => showToast(error.message || 'El evento se creó, pero no se pudo actualizar el listado.', 'warning'));
    } catch (error) {
      const message = error.message || 'Error al publicar el evento';
      setRequestError(message);
      formScrollRef.current?.scrollTo({ y: 0, animated: true });
      showToast(message, 'error');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Crear Evento" showBack onBack={() => router.back()} />

      <ScrollView ref={formScrollRef} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Nuevo Espectáculo en Vivo</Text>
          <Text style={styles.introSubtitle}>
            Configura los datos del evento, tipos de entrada y cupos disponibles para venta inmediata.
          </Text>
        </View>
        {!!requestError && <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.requestError}>{requestError}</Text>}

        {/* Section 1: General Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>1. Datos Generales</Text>

          <Text style={styles.inputLabel}>Nombre del Evento *</Text>
          <TextInput
            accessibilityLabel="Nombre del evento"
            placeholder="Ej: Festival Primavera 2025"
            placeholderTextColor={colors.outline}
            value={name}
            onChangeText={setName}
            style={styles.textInput}
          />
          {!!fieldErrors.name && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.fieldError}>{fieldErrors.name}</Text>}

          <Text style={styles.inputLabel}>Categoría</Text>
          <CategoryScroller style={styles.categoryRow}>
            {categoriesLoading ? <ActivityIndicator accessibilityLabel="Cargando categorías" color={colors.primary} /> : categories.map((cat) => (
              <Pressable
                key={cat}
                accessibilityRole="button"
                accessibilityLabel={`Elegir categoría ${cat}`}
                accessibilityState={{ selected: category === cat }}
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
          </CategoryScroller>

          <Text style={styles.inputLabel}>Descripción del Evento *</Text>
          <TextInput
            accessibilityLabel="Descripción del evento"
            placeholder="Describe la propuesta musical, artística o temática..."
            placeholderTextColor={colors.outline}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[styles.textInput, styles.textArea]}
          />
          {!!fieldErrors.description && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.fieldError}>{fieldErrors.description}</Text>}

          <View style={styles.rowTwo}>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Fecha *</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar fecha. Fecha actual ${date}`} onPress={() => setCalendarVisible(true)} style={styles.textInput}><Text style={styles.pickerValue}>{new Date(`${date}T12:00:00`).toLocaleDateString('es-AR')}</Text></Pressable>
              {!!fieldErrors.date && <Text accessibilityRole="alert" style={styles.fieldError}>{fieldErrors.date}</Text>}
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Hora de inicio *</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar hora. Hora actual ${showTime}`}
                onPress={() => setTimePickerVisible(true)}
                style={[styles.textInput, styles.timeInputButton]}
              >
                <Ionicons name="time-outline" size={16} color={colors.primary} style={styles.timeIcon} />
                <Text style={styles.pickerValue}>{showTime}</Text>
              </Pressable>
              {!!fieldErrors.showTime && <Text accessibilityRole="alert" style={styles.fieldError}>{fieldErrors.showTime}</Text>}
            </View>
          </View>

          <Text style={styles.inputLabel}>Lugar / Recinto *</Text>
          <TextInput
            accessibilityLabel="Lugar del evento"
            placeholder="Ej: Estadio Movistar Arena / Niceto Club"
            placeholderTextColor={colors.outline}
            value={venue}
            onChangeText={setVenue}
            style={styles.textInput}
          />
          {!!fieldErrors.venue && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.fieldError}>{fieldErrors.venue}</Text>}

          <Text style={styles.inputLabel}>Dirección *</Text>
          <TextInput
            accessibilityLabel="Dirección del evento"
            placeholder="Ej: Humboldt 450, Villa Crespo, CABA"
            placeholderTextColor={colors.outline}
            value={venueAddress}
            onChangeText={setVenueAddress}
            style={styles.textInput}
          />
          {!!fieldErrors.venueAddress && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.fieldError}>{fieldErrors.venueAddress}</Text>}

          <Text style={styles.inputLabel}>Imagen de portada</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Elegir imagen desde el dispositivo" onPress={chooseImage} style={styles.imagePicker}><Text style={styles.pickerValue}>{imageUrl ? 'Cambiar imagen seleccionada' : 'Elegir imagen'}</Text></Pressable>
          {imageUrl ? <Image accessibilityLabel="Vista previa de la portada seleccionada" source={{ uri: imageUrl }} style={styles.imagePreview} /> : null}
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
                  accessibilityLabel={`Nombre del tipo de entrada ${index + 1}`}
                  placeholder="Nombre de la entrada"
                  placeholderTextColor={colors.outline}
                  value={tier.name}
                  onChangeText={(val) => updateTier(tier.id, 'name', val)}
                  style={styles.textInputSmall}
                />
                {!!fieldErrors[`${tier.id}.name`] && <Text accessibilityRole="alert" style={styles.fieldError}>{fieldErrors[`${tier.id}.name`]}</Text>}

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabelSmall}>Precio ($) *</Text>
                    <TextInput
                      accessibilityLabel={`Precio del tipo ${tier.name || index + 1}`}
                      placeholder="18000"
                      placeholderTextColor={colors.outline}
                      value={tier.price}
                      onChangeText={(val) => updateTier(tier.id, 'price', val)}
                      style={styles.textInputSmall}
                      keyboardType="decimal-pad"
                    />
                    {!!fieldErrors[`${tier.id}.price`] && <Text accessibilityRole="alert" style={styles.fieldError}>{fieldErrors[`${tier.id}.price`]}</Text>}
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabelSmall}>Cupo Total *</Text>
                    <TextInput
                      accessibilityLabel={`Cupo del tipo ${tier.name || index + 1}`}
                      placeholder="100"
                      placeholderTextColor={colors.outline}
                      value={tier.totalQuota}
                      onChangeText={(val) => updateTier(tier.id, 'totalQuota', val)}
                      style={styles.textInputSmall}
                      keyboardType="number-pad"
                    />
                    {!!fieldErrors[`${tier.id}.totalQuota`] && <Text accessibilityRole="alert" style={styles.fieldError}>{fieldErrors[`${tier.id}.totalQuota`]}</Text>}
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
          {isSubmitting ? <ActivityIndicator color={colors.onPrimary} accessibilityLabel="Publicando evento" /> : <Text style={styles.publishButtonText}>Publicar Evento en Catálogo</Text>}
        </Pressable>
      </ScrollView>
      <Modal visible={calendarVisible} transparent animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.calendarCard}>
            <Text accessibilityRole="header" style={styles.calendarTitle}>Elegí una fecha</Text>
            <View style={styles.calendarHeader}>
              <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.monthButton}><Text style={styles.pickerValue}>‹</Text></Pressable>
              <Text style={styles.calendarMonth}>{monthLabel}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.monthButton}><Text style={styles.pickerValue}>›</Text></Pressable>
            </View>
            <View style={styles.calendarGrid}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => <Text key={day} style={styles.calendarDayLabel}>{day}</Text>)}
              {Array.from({ length: firstDay }, (_, index) => <View key={`blank-${index}`} style={styles.calendarDay} />)}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const candidate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                candidate.setHours(0, 0, 0, 0);
                const disabled = candidate < minimumDate;
                const selected = dateParts[0] === candidate.getFullYear() && dateParts[1] === candidate.getMonth() + 1 && dateParts[2] === day;
                const value = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return <Pressable key={day} disabled={disabled} accessibilityRole="button" accessibilityLabel={`${day} de ${monthLabel}`} accessibilityState={{ disabled, selected }} onPress={() => { setDate(value); setFieldErrors((prev) => ({ ...prev, date: '' })); setCalendarVisible(false); }} style={[styles.calendarDay, selected && styles.calendarDaySelected, disabled && styles.calendarDayDisabled]}><Text style={[styles.calendarDayText, selected && styles.calendarDayTextSelected, disabled && styles.calendarDayTextDisabled]}>{day}</Text></Pressable>;
              })}
            </View>
            <Pressable accessibilityRole="button" onPress={() => setCalendarVisible(false)} style={styles.calendarClose}><Text style={styles.pickerValue}>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={timePickerVisible} transparent animationType="fade" onRequestClose={() => setTimePickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.calendarCard}>
            <Text accessibilityRole="header" style={styles.calendarTitle}>Elegí una hora</Text>
            <Text style={styles.timeSectionLabel}>Hora</Text>
            <View style={styles.hourGrid}>
              {Array.from({ length: 24 }, (_, hour) => {
                const value = String(hour).padStart(2, '0');
                const selected = showTime.slice(0, 2) === value;
                return <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${value} horas`} onPress={() => setShowTime(`${value}:${showTime.slice(3, 5)}`)} style={[styles.timeChoice, selected && styles.timeChoiceSelected]}><Text style={[styles.timeChoiceText, selected && styles.timeChoiceTextSelected]}>{value}</Text></Pressable>;
              })}
            </View>
            <Text style={styles.timeSectionLabel}>Minutos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.minuteRow}>
              {Array.from({ length: 12 }, (_, index) => {
                const value = String(index * 5).padStart(2, '0');
                const selected = showTime.slice(3, 5) === value;
                return <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${value} minutos`} onPress={() => setShowTime(`${showTime.slice(0, 2)}:${value}`)} style={[styles.timeChoice, selected && styles.timeChoiceSelected]}><Text style={[styles.timeChoiceText, selected && styles.timeChoiceTextSelected]}>{value}</Text></Pressable>;
              })}
            </ScrollView>
            <Text accessibilityLiveRegion="polite" style={styles.selectedTime}>Hora seleccionada: {showTime}</Text>
            <Pressable accessibilityRole="button" onPress={() => { setFieldErrors((prev) => ({ ...prev, showTime: '' })); setTimePickerVisible(false); }} style={styles.calendarClose}><Text style={styles.pickerValue}>Confirmar hora</Text></Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={created} transparent animationType="fade" onRequestClose={() => { setCreated(false); router.replace('/(organizer)/events'); }}>
        <View style={styles.modalBackdrop}><View accessibilityViewIsModal accessibilityRole="alert" style={styles.successCard}><Text accessibilityRole="header" style={styles.successTitle}>Evento creado correctamente</Text><Text style={styles.successCopy}>Ya está disponible en tu lista de eventos.</Text><Pressable accessibilityRole="button" onPress={() => { setCreated(false); router.replace('/(organizer)/events'); }} style={styles.publishButton}><Text style={styles.publishButtonText}>Ver mis eventos</Text></Pressable></View></View>
      </Modal>
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
  timeInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeIcon: {
    marginRight: 2,
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
    marginVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
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
  fieldError: { color: colors.error, fontSize: 12, marginTop: 4, marginBottom: spacing.xs },
  pickerValue: { color: colors.onSurface, fontSize: 14, textAlign: 'center' },
  imagePicker: { minHeight: 52, justifyContent: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow, padding: spacing.md },
  imagePreview: { width: '100%', height: 150, marginTop: spacing.sm, borderRadius: borderRadius.md },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  calendarCard: { width: '100%', maxWidth: 380, borderRadius: borderRadius.lg, padding: spacing.md, backgroundColor: colors.surfaceContainerLow },
  calendarTitle: { color: colors.onSurface, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.sm },
  calendarMonth: { color: colors.onSurface, fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  monthButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayLabel: { width: '14.285%', height: 40, textAlign: 'center', textAlignVertical: 'center', color: colors.onSurfaceVariant, fontWeight: '700' },
  calendarDay: { width: '14.285%', height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: borderRadius.full },
  calendarDaySelected: { backgroundColor: colors.primary },
  calendarDayDisabled: { opacity: 0.4 },
  calendarDayText: { color: colors.onSurface, fontSize: 15 },
  calendarDayTextSelected: { color: colors.onPrimary, fontWeight: '800' },
  calendarDayTextDisabled: { color: colors.outline },
  calendarClose: { minHeight: 48, justifyContent: 'center', marginTop: spacing.sm },
  requestError: { color: colors.error, backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.error, borderRadius: borderRadius.md, padding: spacing.md, fontWeight: '700' },
  timeSectionLabel: { color: colors.onSurfaceVariant, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  minuteRow: { gap: spacing.xs, paddingVertical: spacing.xs },
  timeChoice: { minWidth: 44, minHeight: 44, paddingHorizontal: spacing.xs, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerHigh },
  timeChoiceSelected: { backgroundColor: colors.primary },
  timeChoiceText: { color: colors.onSurface, fontWeight: '600' },
  timeChoiceTextSelected: { color: colors.onPrimary, fontWeight: '800' },
  selectedTime: { color: colors.onSurface, marginTop: spacing.sm, textAlign: 'center', fontSize: 16, fontWeight: '800' },
  successCard: { width: '100%', maxWidth: 380, borderRadius: borderRadius.lg, padding: spacing.lg, backgroundColor: colors.surfaceContainerLow },
  successTitle: { color: colors.success, fontWeight: '800', fontSize: 20, textAlign: 'center' },
  successCopy: { color: colors.onSurfaceVariant, marginVertical: spacing.md, textAlign: 'center' },
  btnPressed: {
    opacity: 0.85,
  },
});
export default CreateEventScreen;
