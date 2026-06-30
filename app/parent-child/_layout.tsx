import React from "react";
import { Stack } from "expo-router";

export default function ParentChildLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}