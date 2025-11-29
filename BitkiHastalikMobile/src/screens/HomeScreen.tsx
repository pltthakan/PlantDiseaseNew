import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { predictApi } from "../api";

export default function HomeScreen({ navigation }: any) {
  const [userId, setUserId] = useState<number | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("user_id");
      if (!id) navigation.replace("Auth");
      else setUserId(Number(id));
    })();
  }, [navigation]);

  const chooseFromGallery = async () => {
    const res = await launchImageLibrary({ mediaType: "photo", quality: 0.9 });
    if (res.didCancel) return;
    const a = res.assets?.[0];
    if (!a?.uri) return;
    setUri(a.uri);
    setResult(null);
  };

  const takePhoto = async () => {
    const res = await launchCamera({ mediaType: "photo", quality: 0.9, saveToPhotos: true });
    if (res.didCancel) return;
    const a = res.assets?.[0];
    if (!a?.uri) return;
    setUri(a.uri);
    setResult(null);
  };

  const predict = async () => {
    try {
      if (!userId || !uri) return;
      setLoading(true);

      const image = {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      };

      const data = await predictApi({ userId, image });
      setResult(data);
    } catch (e: any) {
      Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user_id");
    navigation.replace("Auth");
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Ana Sayfa</Text>

      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={chooseFromGallery}>
          <Text style={s.btnText}>Galeriden Seç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btn} onPress={takePhoto}>
          <Text style={s.btnText}>Kamerayla Çek</Text>
        </TouchableOpacity>
      </View>

      {uri ? <Image source={{ uri }} style={s.preview} /> : <Text style={s.hint}>Foto seç/çek.</Text>}

      <TouchableOpacity style={[s.mainBtn, (!userId || !uri || loading) && { opacity: 0.5 }]} disabled={!userId || !uri || loading} onPress={predict}>
        {loading ? <ActivityIndicator /> : <Text style={s.mainBtnText}>Tahmin Et</Text>}
      </TouchableOpacity>

      {result && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Sonuç</Text>
          <Text>Hastalık: {result.class_name}</Text>
          <Text>Güven: {(result.confidence * 100).toFixed(2)}%</Text>
          <Text>Tarih: {new Date(result.created_at).toLocaleString()}</Text>
        </View>
      )}

      <View style={s.row2}>
        <TouchableOpacity style={s.secondary} onPress={() => navigation.navigate("History")}>
          <Text style={s.secondaryText}>Geçmiş</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondary} onPress={logout}>
          <Text style={s.secondaryText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, backgroundColor: "#111827", padding: 12, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white", fontWeight: "700" },
  hint: { marginTop: 14, color: "#6b7280" },
  preview: { width: "100%", height: 260, borderRadius: 16, marginTop: 12, backgroundColor: "#eee" },
  mainBtn: { marginTop: 12, backgroundColor: "#2563eb", padding: 14, borderRadius: 12, alignItems: "center" },
  mainBtnText: { color: "white", fontWeight: "800" },
  card: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  cardTitle: { fontWeight: "800", marginBottom: 6 },
  row2: { flexDirection: "row", gap: 10, marginTop: 12 },
  secondary: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  secondaryText: { fontWeight: "700" },
});
