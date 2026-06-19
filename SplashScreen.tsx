import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import logo from '../assets/logo.png';

export default function SplashScreen() {
  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Image, { source: logo, style: styles.logo }),
    React.createElement(Text, { style: styles.tagline }, 'You’re not alone. We walk with you.')
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
