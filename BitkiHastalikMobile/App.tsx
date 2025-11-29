import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Ana Sayfa" }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Geçmiş Taramalar" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
