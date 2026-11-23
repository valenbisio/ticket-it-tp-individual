/* eslint-disable react/prop-types */
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors } from '../../data/theme.js';

export function CategoryScroller({ children, contentContainerStyle, style }) {
  const scrollRef = useRef(null);
  const metrics = useRef({ offset: 0, viewport: 0, content: 0 });
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollAvailability = () => {
    const { offset, viewport, content } = metrics.current;
    setCanScrollBackward(offset > 1);
    setCanScrollForward(content - viewport - offset > 1);
  };

  const scroll = (direction) => {
    const { offset, viewport } = metrics.current;
    scrollRef.current?.scrollTo({
      x: Math.max(0, offset + direction * Math.max(viewport * 0.7, 120)),
      animated: true,
    });
  };

  return (
    <View style={[styles.row, style]}>
      {canScrollBackward && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver categorías anteriores"
          accessibilityHint="Desplaza la lista de categorías hacia la izquierda"
          onPress={() => scroll(-1)}
          style={({ pressed }) => [styles.arrowButton, styles.arrowButtonLeft, pressed && styles.arrowButtonPressed]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </Pressable>
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        onLayout={(event) => {
          metrics.current.viewport = event.nativeEvent.layout.width;
          updateScrollAvailability();
        }}
        onContentSizeChange={(width) => {
          metrics.current.content = width;
          updateScrollAvailability();
        }}
        onScroll={(event) => {
          metrics.current.offset = event.nativeEvent.contentOffset.x;
          updateScrollAvailability();
        }}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      {canScrollForward && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver más categorías"
          accessibilityHint="Desplaza la lista de categorías hacia la derecha"
          onPress={() => scroll(1)}
          style={({ pressed }) => [styles.arrowButton, styles.arrowButtonRight, pressed && styles.arrowButtonPressed]}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  arrowButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  arrowButtonLeft: {
    marginRight: 6,
  },
  arrowButtonRight: {
    marginLeft: 6,
  },
  arrowButtonPressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceBright,
    transform: [{ scale: 0.95 }],
  },
});
