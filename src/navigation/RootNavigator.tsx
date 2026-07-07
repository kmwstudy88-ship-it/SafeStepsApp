// RootNavigation.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ParentProfileScreen from "../screens/ParentProfileScreen";
import CurriculumScreen from "../screens/CurriculumScreen";
import UploadDocumentsScreen from "../screens/UploadDocumentsScreen";

const Tab = createBottomTabNavigator();

export default function RootNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Parent Profile" component={ParentProfileScreen} />
      <Tab.Screen name="Curriculum" component={CurriculumScreen} />
      <Tab.Screen name="Upload Documents" component={UploadDocumentsScreen} />
    </Tab.Navigator>
  );
}
