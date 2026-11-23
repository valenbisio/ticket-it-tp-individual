import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext.jsx';
import { Header } from '../components/common/Header.jsx';
import { api } from '../services/api.js';
import { colors, spacing, borderRadius } from '../data/theme.js';

export const PurchaseChatScreen = () => {
  const { id } = useLocalSearchParams(); // purchaseId
  const router = useRouter();
  const { purchases, conversations, currentUser, showToast, loadConversations, lastChatMessage } = useApp();

  const purchase = useMemo(() => {
    return purchases.find((p) => p.id === id) || null;
  }, [purchases, id]);
  const conversation = useMemo(() => conversations.find((item) => item.id === id) || null, [conversations, id]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const msgs = await api.getChatMessages(id, currentUser.id);
        setMessages((previous) => {
          const merged = new Map(previous.map((message) => [message.id, message]));
          msgs.forEach((message) => merged.set(message.id, message));
          return Array.from(merged.values()).sort((a, b) => Date.parse(a.sentAt || 0) - Date.parse(b.sentAt || 0));
        });
        await loadConversations();
      } catch (error) {
        const message = error.message || 'No se pudo cargar la conversación';
        setLoadError(message);
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) void loadChat();
  }, [id, currentUser.id, showToast, loadConversations]);

  useEffect(() => {
    if (!id || lastChatMessage?.compraId !== id) return undefined;
    let active = true;
    void api.getChatMessages(id, currentUser.id)
      .then((latestMessages) => {
        if (!active) return;
        setMessages((previous) => {
          const merged = new Map(previous.map((message) => [message.id, message]));
          latestMessages.forEach((message) => merged.set(message.id, message));
          return Array.from(merged.values()).sort((a, b) => Date.parse(a.sentAt || 0) - Date.parse(b.sentAt || 0));
        });
        return loadConversations();
      })
      .catch((error) => showToast(error.message || 'No se pudo actualizar el chat', 'error'));
    return () => { active = false; };
  }, [id, lastChatMessage, currentUser.id, loadConversations, showToast]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      setIsSending(true);
      const newMsg = await api.sendChatMessage(id, currentUser.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: currentUser.avatar,
        text: inputText.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      await loadConversations();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      showToast(error.message || 'Error al enviar el mensaje', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.senderId === currentUser.id;

    return (
      <View style={[styles.msgRow, isMe ? styles.myMsgRow : styles.otherMsgRow]}>
        {!isMe && (
          <Image source={{ uri: item.senderAvatar }} style={styles.msgAvatar} />
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.senderName, isMe && styles.mySenderName]}>
            {item.senderName} • {item.senderRole === 'buyer' ? 'Comprador' : 'Organizador'}
          </Text>
          <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.text}</Text>
          <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Header title="Chat de la Compra" showBack onBack={() => router.back()} />

      {/* Purchase Context Banner */}
      {(purchase || conversation) && (
        <View style={styles.contextBanner}>
          <View style={styles.contextIconBox}>
            <Text style={styles.contextIcon}>🎟️</Text>
          </View>
          <View style={styles.contextCol}>
            <Text style={styles.contextEventName} numberOfLines={1}>
              {purchase?.eventName || conversation?.eventName}
            </Text>
            <Text style={styles.contextSub}>
              {purchase ? `Compra #${purchase.id} • ${purchase.tierName} (×${purchase.quantity})` : `Conversación de compra #${conversation.id}`}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedText}>Canal Seguro</Text>
          </View>
        </View>
      )}

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={isLoading ? [] : messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={isLoading ? (
          <View accessibilityRole="progressbar" accessibilityLabel="Cargando mensajes" style={styles.loadingMessages}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : loadError ? (
          <View style={styles.emptyChat}><Text accessibilityRole="alert" style={styles.emptyChatTitle}>{loadError}</Text></View>
        ) : (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>💬</Text>
            <Text style={styles.emptyChatTitle}>Comienza la conversación</Text>
            <Text style={styles.emptyChatSubtitle}>
              Consulta detalles del evento, accesos o dudas sobre tu entrada.
            </Text>
          </View>
        )}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={currentUser.role === 'organizer' ? 'Escribí un mensaje al comprador...' : 'Escribí un mensaje al organizador...'}
          placeholderTextColor={colors.outline}
          value={inputText}
          onChangeText={setInputText}
          multiline
          style={styles.chatInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          accessibilityHint="Envía el mensaje escrito"
          accessibilityState={{ disabled: !inputText.trim() || isSending, busy: isSending }}
          disabled={!inputText.trim() || isSending}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          {isSending ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  contextIconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contextIcon: {
    fontSize: 16,
  },
  contextCol: {
    flex: 1,
  },
  contextEventName: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '800',
  },
  contextSub: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 1,
  },
  verifiedTag: {
    backgroundColor: 'rgba(76, 215, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  verifiedText: {
    color: colors.tertiary,
    fontSize: 9,
    fontWeight: '700',
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'flex-end',
  },
  myMsgRow: {
    justifyContent: 'flex-end',
  },
  otherMsgRow: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  myBubble: {
    backgroundColor: colors.primaryContainer,
    borderBottomRightRadius: borderRadius.xs,
  },
  otherBubble: {
    backgroundColor: colors.surfaceContainerHigh,
    borderBottomLeftRadius: borderRadius.xs,
  },
  senderName: {
    color: colors.tertiary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  mySenderName: {
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },
  msgText: {
    color: colors.onSurface,
    fontSize: 13,
    lineHeight: 18,
  },
  myMsgText: {
    color: colors.onPrimaryContainer,
    fontWeight: '500',
  },
  timestamp: {
    color: colors.outline,
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myTimestamp: {
    color: colors.onPrimaryContainer,
    opacity: 0.7,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyChatTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyChatSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: colors.onSurface,
    fontSize: 13,
    maxHeight: 90,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendIcon: {
    color: colors.onPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingMessages: { paddingTop: spacing.xl, alignItems: 'center' },
});
export default PurchaseChatScreen;
