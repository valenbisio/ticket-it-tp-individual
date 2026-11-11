import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { BottomTabBar } from '../components/common/BottomTabBar.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

const CATEGORIES = ['Todas', 'Música', 'Teatro'];

export const ExploreEventsScreen = () => {
  const router = useRouter();
  const { events, loadEvents, favorites, toggleFavorite, currentUser, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('fecha'); // 'fecha' | 'precio' | 'puntaje'

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadEvents({
        q: search.trim(),
        categoria: selectedCategory === 'Todas' ? undefined : selectedCategory,
        ordenarPor: sortBy,
      }).catch((error) => showToast(error.message || 'No se pudieron buscar eventos', 'error'));
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadEvents, search, selectedCategory, sortBy, showToast]);

  const renderEventCard = ({ item }) => {
    const minPrice = Math.min(...(item.tiers?.map((t) => t.price) || [0]));
    const isFav = favorites.includes(item.id);
    const totalRemaining = item.tiers?.reduce((acc, t) => acc + (t.totalQuota - t.soldCount), 0) || 0;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Evento ${item.name}, precio desde $${minPrice}`}
        onPress={() => router.push(`/(buyer)/event/${item.id}`)}
        style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
      >
        {/* Event Banner */}
        <View style={styles.imageBox}>
          <Image source={{ uri: item.imageUrl }} style={styles.eventImage} resizeMode="cover" />
          <View style={styles.imageScrim} />

          {/* Top Badges */}
          <View style={styles.topBadgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              onPress={(e) => {
                e?.stopPropagation?.();
                toggleFavorite(item.id);
              }}
              style={styles.favoriteButton}
            >
              <Text style={styles.favoriteIcon}>{isFav ? '❤️' : '🤍'}</Text>
            </Pressable>
          </View>

          {/* Floating Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{item.displayDate || item.date}</Text>
          </View>
        </View>

        {/* Content details */}
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.venueText} numberOfLines={1}>
            📍 {item.venue}
          </Text>

          {/* Organizer & Rating Meta */}
          <View style={styles.metaRow}>
            <View style={styles.organizerRatingBox}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingNumber}>{item.organizerRating}</Text>
              <Text style={styles.organizerName} numberOfLines={1}>
                • {item.organizerName}
              </Text>
            </View>
            <View style={styles.quotaPill}>
              <Text style={styles.quotaText}>{totalRemaining} cupos</Text>
            </View>
          </View>

          {/* Bottom Price & CTA */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.fromLabel}>Desde</Text>
              <Text style={styles.priceValue}>${minPrice.toLocaleString('es-AR')}</Text>
            </View>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Comprar Entrada →</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <Header subtitle="Explorar Eventos" />

      {/* Main List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* User greeting */}
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greetingSmall}>Bienvenido de vuelta</Text>
                <Text style={styles.greetingTitle}>¡Hola {currentUser.name}! 👋</Text>
              </View>
              <View style={styles.cityPill}>
                <Text style={styles.cityText}>📍 Buenos Aires</Text>
              </View>
            </View>

            {/* Smart Assistant Tip */}
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>✨</Text>
              <View style={styles.tipCol}>
                <Text style={styles.tipTitle}>Smart Match AI</Text>
                <Text style={styles.tipSubtitle}>
                  Selección de festivales y shows con cupos disponibles hoy
                </Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                placeholder="Buscar por nombre, artista o sala..."
                placeholderTextColor={colors.outline}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Category Chips Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar por categoría ${cat}`}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.selectedCategoryChipText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Sort Controls Bar */}
            <View style={styles.sortBar}>
              <Text style={styles.sortTitle}>Ordenar por:</Text>
              <View style={styles.sortButtonsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSortBy('fecha')}
                  style={[styles.sortButton, sortBy === 'fecha' && styles.activeSortButton]}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'fecha' && styles.activeSortBtnText]}>
                    📅 Fecha
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSortBy('precio')}
                  style={[styles.sortButton, sortBy === 'precio' && styles.activeSortButton]}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'precio' && styles.activeSortBtnText]}>
                    💲 Precio
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSortBy('puntaje')}
                  style={[styles.sortButton, sortBy === 'puntaje' && styles.activeSortButton]}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'puntaje' && styles.activeSortBtnText]}>
                    ⭐ Puntaje
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎭</Text>
            <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
            <Text style={styles.emptySubtitle}>
              Prueba cambiando los filtros o el término de búsqueda.
            </Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greetingSmall: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  greetingTitle: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '800',
  },
  cityPill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  cityText: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipCol: {
    flex: 1,
  },
  tipTitle: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
  },
  tipSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 46,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 13,
  },
  clearSearch: {
    color: colors.outline,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  categoriesScroll: {
    marginVertical: spacing.xs,
  },
  categoriesContainer: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primaryContainer,
  },
  categoryChipText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedCategoryChipText: {
    color: colors.onPrimaryContainer,
    fontWeight: '800',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  sortTitle: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  activeSortButton: {
    backgroundColor: colors.primaryContainer,
  },
  sortBtnText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
  },
  activeSortBtnText: {
    color: colors.onPrimaryContainer,
  },
  eventCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageBox: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceContainerLowest,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(11, 19, 38, 0.6)',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(11, 19, 38, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 19, 38, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 14,
  },
  dateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(11, 19, 38, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  dateBadgeText: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: '700',
  },
  cardContent: {
    padding: spacing.md,
  },
  eventTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  venueText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  organizerRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starIcon: {
    color: colors.tertiary,
    fontSize: 13,
    marginRight: 3,
  },
  ratingNumber: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 4,
  },
  organizerName: {
    color: colors.outline,
    fontSize: 11,
    flex: 1,
  },
  quotaPill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  quotaText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  fromLabel: {
    color: colors.outline,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  priceValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  ctaButton: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  ctaText: {
    color: colors.onPrimaryContainer,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
  },
});
export default ExploreEventsScreen;
