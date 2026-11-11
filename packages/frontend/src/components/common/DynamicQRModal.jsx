import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useApp } from '../../contexts/AppContext.jsx';
import { colors, spacing, borderRadius } from '../../data/theme.js';

export const DynamicQRModal = () => {
  const { activeQR, setActiveQR } = useApp();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!activeQR) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQR]);

  if (!activeQR) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(activeQR)}
      onRequestClose={() => setActiveQR(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.securityBadge}>
              <Text style={styles.securityDot}>●</Text>
              <Text style={styles.securityText}>Pase Dinámico Anti-Fraude</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar modal QR"
              onPress={() => setActiveQR(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Event Header */}
          <View style={styles.headerBox}>
            <Text style={styles.eventName}>{activeQR.eventName}</Text>
            <Text style={styles.eventDate}>
              {activeQR.eventDisplayDate || activeQR.eventDate} • {activeQR.tierName}
            </Text>
            <Text style={styles.ticketId}>Código: {activeQR.id}</Text>
          </View>

          {/* QR Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrMatrixBox}>
              {/* Simulated High-Contrast QR Code Blocks */}
              <View style={styles.qrRow}>
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
              </View>
              <View style={styles.qrRow}>
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
              </View>
              <View style={styles.qrRow}>
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
              </View>
              <View style={styles.qrRow}>
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
              </View>
              <View style={styles.qrRow}>
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
                <View style={[styles.qrBlock, styles.qrEmpty]} />
                <View style={styles.qrBlock} />
                <View style={styles.qrBlock} />
              </View>

              {/* Dynamic Scan Line */}
              <View style={styles.scanLine} />
            </View>

            {/* Token & Dynamic Refresh */}
            <View style={styles.refreshBadge}>
              <Text style={styles.refreshIcon}>⚡</Text>
              <Text style={styles.refreshText}>
                Se actualiza en {countdown}s para evitar capturas
              </Text>
            </View>
          </View>

          {/* Attendee Info */}
          <View style={styles.attendeeCard}>
            <Text style={styles.attendeeLabel}>Titular de la entrada</Text>
            <Text style={styles.attendeeName}>
              {activeQR.buyerName || 'Juan Pérez'} • 1 de {activeQR.quantity} entrada(s)
            </Text>
            <Text style={styles.venueText}>{activeQR.venue}</Text>
          </View>

          {/* Done Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entendido, cerrar"
            onPress={() => setActiveQR(null)}
            style={({ pressed }) => [styles.doneButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.doneButtonText}>Listo, cerrar pase</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 14, 32, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  securityDot: {
    color: colors.tertiary,
    fontSize: 10,
    marginRight: 6,
  },
  securityText: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerBox: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  eventName: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  eventDate: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  ticketId: {
    color: colors.outline,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  qrMatrixBox: {
    width: 170,
    height: 170,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    position: 'relative',
    padding: 8,
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 24,
  },
  qrBlock: {
    width: 24,
    height: 24,
    backgroundColor: '#0b1326',
    borderRadius: 2,
  },
  qrEmpty: {
    backgroundColor: 'transparent',
  },
  scanLine: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 2,
  },
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(11, 19, 38, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  refreshIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  refreshText: {
    color: '#131b2e',
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  attendeeLabel: {
    color: colors.outline,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  attendeeName: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  venueText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  doneButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
