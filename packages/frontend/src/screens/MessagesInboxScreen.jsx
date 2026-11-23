import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { BottomTabBar } from '../components/common/BottomTabBar.jsx';
import { colors, spacing, borderRadius } from '../data/theme.js';

const fechaVisible = (fecha) => fecha
  ? new Date(fecha).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '';

export const MessagesInboxScreen = () => {
  const router = useRouter();
  const { currentRole, conversations, loadConversations } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadConversations()
      .catch((loadError) => { if (active) setError(loadError.message || 'No se pudieron cargar los mensajes.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadConversations]));

  const renderConversation = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat de ${item.eventName} con ${item.participantName}${item.unreadCount ? `, ${item.unreadCount} mensajes sin leer` : ''}`}
      accessibilityHint="Abre la conversación de esta compra"
      onPress={() => router.push(`/chat/${item.id}`)}
      style={({ pressed }) => [styles.conversationCard, pressed && styles.pressed]}
    >
      <View style={styles.conversationTop}>
        <View style={styles.conversationText}>
          <Text style={styles.eventName} numberOfLines={1}>{item.eventName}</Text>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.participantName} · {item.participantRole === 'organizer' ? 'Organizador' : 'Comprador'}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={2}>{item.lastMessage}</Text>
        <Text style={styles.timestamp}>{fechaVisible(item.lastMessageAt)}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <Header title="Mensajes" />
      {loading && conversations.length === 0 ? (
        <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel="Cargando conversaciones">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}><Text accessibilityRole="alert" style={styles.emptyText}>{error}</Text></View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Todavía no tenés mensajes</Text>
          <Text style={styles.emptyText}>{currentRole === 'buyer' ? 'Cuando escribas sobre una compra, la conversación aparecerá acá.' : 'Cuando un comprador te escriba por una compra, la conversación aparecerá acá.'}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="Conversaciones de compras"
        />
      )}
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  conversationCard: { minHeight: 96, padding: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.surfaceContainerHighest, justifyContent: 'center' },
  pressed: { opacity: 0.82 },
  conversationTop: { flexDirection: 'row', alignItems: 'center' },
  conversationText: { flex: 1 },
  eventName: { color: colors.onSurface, fontSize: 15, fontWeight: '800' },
  participantName: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 3 },
  unreadBadge: { minWidth: 24, minHeight: 24, paddingHorizontal: 6, borderRadius: borderRadius.full, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm },
  unreadText: { color: colors.onSecondary, fontSize: 12, fontWeight: '800' },
  previewRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.sm, gap: spacing.sm },
  lastMessage: { flex: 1, color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 18 },
  unreadMessage: { color: colors.onSurface, fontWeight: '700' },
  timestamp: { color: colors.onSurfaceVariant, fontSize: 10, marginBottom: 1 },
  center: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.onSurface, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },
});

export default MessagesInboxScreen;
