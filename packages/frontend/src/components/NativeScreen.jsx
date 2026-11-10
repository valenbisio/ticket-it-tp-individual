/* eslint-disable react/prop-types */
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export const colors = { bg: '#0b1326', card: '#171f33', cardAlt: '#222a3d', text: '#eef1ff', muted: '#b7bfd6', accent: '#b7b8ff', green: '#52d69a', warning: '#f5bb4f', danger: '#ff9da3' };

export function NativeScreen({ title, children, rightAction }) {
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><View style={s.header}><Text style={s.title}>{title}</Text>{rightAction}</View>{children}</ScrollView></SafeAreaView>;
}

export function NativeCard({ title, detail, action, onPress, children }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.card, pressed && onPress ? s.pressed : null]}><Text style={s.cardTitle}>{title}</Text>{detail ? <Text style={s.detail}>{detail}</Text> : null}{children}{action ? <Text style={s.action}>{action}</Text> : null}</Pressable>;
}

export function NativeButton({ label, onPress, variant = 'primary', disabled = false }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, s[variant], (pressed || disabled) && s.pressed]}><Text style={[s.buttonText, variant === 'secondary' && s.secondaryText]}>{label}</Text></Pressable>;
}

export function NativeInput({ value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} keyboardType={keyboardType} style={[s.input, multiline && s.multiline]} />;
}

export function NativeText({ children, style }) { return <Text style={[s.detail, style]}>{children}</Text>; }
export function Status({ children }) { return <View style={s.status}><Text style={s.statusText}>{children}</Text></View>; }

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, gap: 12 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }, title: { color: colors.text, fontSize: 27, fontWeight: '800', flex: 1 }, card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 8 }, cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' }, detail: { color: colors.muted, fontSize: 14, lineHeight: 20 }, action: { color: colors.accent, fontWeight: '700', marginTop: 4 }, button: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' }, primary: { backgroundColor: colors.accent }, secondary: { backgroundColor: colors.cardAlt }, danger: { backgroundColor: '#7d2935' }, buttonText: { color: '#151636', fontWeight: '800' }, secondaryText: { color: colors.text }, input: { color: colors.text, backgroundColor: colors.cardAlt, borderRadius: 12, padding: 13, fontSize: 15 }, multiline: { minHeight: 100, textAlignVertical: 'top' }, status: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: '#21473a' }, statusText: { color: colors.green, fontWeight: '700', fontSize: 12 }, pressed: { opacity: 0.65 },
});
