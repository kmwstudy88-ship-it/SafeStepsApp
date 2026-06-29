import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { label: 'Home', icon: 'home-outline', route: '/home' },
    { label: 'Learning', icon: 'book-outline', route: '/learning-hub' },
    { label: 'Programs', icon: 'list-outline', route: '/programs' },
    { label: 'My Story', icon: 'person-outline', route: '/my-story' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {tabs.map((tab, index) => {
        const active = pathname === tab.route;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.tab, active && styles.activeTab]}
            onPress={() => router.push(tab.route)}
          >
            <Ionicons
              name={tab.icon}
              size={26}
              color={active ? '#1A3C40' : '#7A9E9F'}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#D0E4E2',
    justifyContent: 'space-around',
    paddingTop: 10,
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.08)',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#E8F4F2',
  },
  label: {
    fontSize: 12,
    color: '#7A9E9F',
    marginTop: 4,
  },
  activeLabel: {
    color: '#1A3C40',
    fontWeight: '700',
  },
});
