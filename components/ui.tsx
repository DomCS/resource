import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
export const colors = {
  bg: "#0b1220",
  panel: "#141e30",
  panel2: "#1b2940",
  line: "#2a3a53",
  text: "#f2f5fb",
  muted: "#9aaac1",
  accent: "#69e0bd",
  blue: "#84b7ff",
  danger: "#ff8585",
  yellow: "#f4cb75",
};
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
export function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.heading}>{title}</Text>
      {subtitle ? <Text style={s.muted}>{subtitle}</Text> : null}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#687991"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          s.input,
          multiline && { minHeight: 82, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Button({
  title,
  onPress,
  kind = "primary",
}: {
  title: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.button,
        kind === "primary" && { backgroundColor: colors.accent },
        kind === "secondary" && { backgroundColor: colors.panel2 },
        kind === "danger" && { backgroundColor: "#512934" },
        kind === "ghost" && {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.line,
        },
      ]}
    >
      <Text
        style={[
          s.buttonText,
          kind === "primary" && { color: "#09251f" },
          kind === "danger" && { color: colors.danger },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Tag({
  text,
  color = colors.accent,
  onPress,
  kind = "primary",
}: {
  text: string;
  color?: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.button,
        kind === "primary" && { backgroundColor: colors.accent },
        kind === "secondary" && { backgroundColor: colors.panel2 },
        kind === "danger" && { backgroundColor: "#512934" },
        kind === "ghost" && {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.line,
        },
        color && {
          backgroundColor: color,
          borderWidth: 1,
          borderColor: colors.line,
        },
        color === "ghost" && {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.line,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: color + "20",
          paddingHorizontal: 9,
          paddingVertical: 5,
          borderRadius: 20,
          alignSelf: "flex-start",
        }}
      >
        <Text>{text}</Text>
      </View>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    color: colors.muted,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: "#0d1727",
    fontSize: 14,
  },
  button: {
    color: colors.muted,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginBottom: 7,
  },
  buttonText: { fontSize: 13, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  compact: { color: colors.muted, margin: 0, padding: 0, lineHeight: 3, width: "max-content"},
});
