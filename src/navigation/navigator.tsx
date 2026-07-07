import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RootNavigation from "./RootNavigation";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={RootNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
