import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { globalStyles } from "../styles/styles";

export default function Home() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>SafeSteps Dev Menu</Text>
      <Text style={globalStyles.subtitle}>
        Quick links to core flows while we build the app.
      </Text>

      <Link href="/login" style={globalStyles.link}>
        Login
      </Link>
      <Link href="/register" style={globalStyles.link}>
        Create Account
      </Link>
      <Link href="/programs" style={globalStyles.link}>
        Program Selection
      </Link>
      <Link href="/lessons" style={globalStyles.link}>
        Lessons
      </Link>
      <Link href="/tasks" style={globalStyles.link}>
        Tasks
      </Link>
      <Link href="/evidence" style={globalStyles.link}>
        Evidence Upload
      </Link>
      <Link href="/assessments" style={globalStyles.link}>
        Assessments
      </Link>
    </View>
  );
}
