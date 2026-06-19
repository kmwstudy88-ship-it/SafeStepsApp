import { View, Text } from 'react-native';
import { global } from './styles';

export default function Dashboard() {
  return (
    <View style={global.container}>
      <Text style={global.title}>Dashboard</Text>
      <Text style={global.subtitle}>Your progress overview</Text>
    </View>
  );
}
