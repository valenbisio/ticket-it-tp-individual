import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
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
  const { purchases, currentUser, showToast } = useApp();

  const purchase = useMemo(() => {
    return purchases.find((p) => p.id === id) || purchases[0];
  }, [purchases, id]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!purchase) return;
    const loadChat = async () => {
      const msgs = await api.getChatMessages(purchase.id, currentUser.id);
      setMessages(msgs);
    };
    loadChat();
  }, [purchase, currentUser.id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      setIsSending(true);
      const newMsg = await api.sendChatMessage(purchase.id, currentUser.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: currentUser.avatar,
        text: inputText.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      showToast('Error al enviar el mensaje', 'error');
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
      {purchase && (
        <View style={styles.contextBanner}>
          <View style={styles.contextIconBox}>
            <Text style={styles.contextIcon}>🎟️</Text>
          </View>
          <View style={styles.contextCol}>
            <Text style={styles.contextEventName} numberOfLines={1}>
              {purchase.eventName}
            </Text>
            <Text style={styles.contextSub}>
              Compra #{purchase.id} • {purchase.tierName} (×{purchase.quantity})
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
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>💬</Text>
            <Text style={styles.emptyChatTitle}>Comienza la conversación</Text>
            <Text style={styles.emptyChatSubtitle}>
              Consulta detalles del evento, accesos o dudas sobre tu entrada.
            </Text>
          </View>
        }
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Escribe un mensaje al organizador..."
          placeholderTextColor={colors.outline}
          value={inputText}
          onChangeText={setInputText}
          multiline
          style={styles.chatInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          disabled={!inputText.trim() || isSending}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendIcon: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default PurchaseChatScreen;
