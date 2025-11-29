import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, registerApi } from "../api";

export default function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const fn = mode === "login" ? loginApi : registerApi;
      const res = await fn(email.trim(), password);
      await AsyncStorage.setItem("user_id", String(res.user_id));
      navigation.replace("Home");
    } catch (e: any) {
      Alert.alert("Hata", e.message);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Bitki Hastalık</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={s.btnText}>{mode === "login" ? "Giriş Yap" : "Kayıt Ol"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text style={s.link}>
          {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Hesabın var mı? Giriş yap"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: "#111827", padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white", fontWeight: "700" },
  link: { marginTop: 12, textAlign: "center", color: "#2563eb" },
});
