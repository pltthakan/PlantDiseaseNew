import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { historyApi } from "../api";

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem("user_id");
      if (!id) throw new Error("Giriş yok");
      const data = await historyApi(Number(id));
      setItems(data);
    } catch (e: any) {
      Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <View style={s.center}><ActivityIndicator /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>Kayıt yok.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.t}>{item.class_name}</Text>
            <Text>Güven: {(item.confidence * 100).toFixed(2)}%</Text>
            <Text style={s.d}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10 },
  t: { fontWeight: "800", marginBottom: 4 },
  d: { marginTop: 6, color: "#6b7280" },
});
