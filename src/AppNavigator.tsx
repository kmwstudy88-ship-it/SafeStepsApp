import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

type RootStackParamList = {
  Root: undefined;
};

// Inline placeholder for RootNavigation to avoid unresolved import errors.
// Replace with actual import when RootNavigation.tsx is available.
const RootNavigation: React.FC = () => null;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={RootNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
