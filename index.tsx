import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { global } from './styles';

export default function Index() {
  return (
    <View style={[global.container, global.center]}>
      <Text style={global.title}>SafeSteps</Text>
      <Text style={global.subtitle}>Choose a screen to begin</Text>

      <Link href="/splash-screen" style={global.link}>Splash</Link>
      <Link href="/create-account" style={global.link}>Create Account</Link>
      <Link href="/welcome" style={global.link}>Welcome</Link>
      <Link href="/my-story" style={global.link}>My Story</Link>
      <Link href="/dashboard" style={global.link}>Dashboard</Link>
      <Link href="/program-selection" style={global.link}>Program Selection</Link>
      <Link href="/weekly-view" style={global.link}>Weekly View</Link>
      <Link href="/lesson-viewer" style={global.link}>Lesson Viewer</Link>
      <Link href="/evidence-upload" style={global.link}>Evidence Upload</Link>
      <Link href="/settings" style={global.link}>Settings</Link>
    </View>
  );
}
