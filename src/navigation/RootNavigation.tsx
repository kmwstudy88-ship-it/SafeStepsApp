import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "./types";

import HomeScreen from "../screens/HomeScreen";
import ParentProfileScreen from "../screens/ParentProfileScreen";
import CurriculumScreen from "../screens/CurriculumScreen";
import UploadDocumentsScreen from "../screens/UploadDocumentsScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigation() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ParentProfile" component={ParentProfileScreen} />
      <Tab.Screen name="Curriculum" component={CurriculumScreen} />
      <Tab.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
    </Tab.Navigator>
  );
}
