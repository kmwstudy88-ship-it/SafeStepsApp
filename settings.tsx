import { View, Text } from 'react-native';
import { global } from './styles';

export default function Settings() {
  return (
    <View style={global.container}>
      <Text style={global.title}>Settings</Text>
    </View>
  );
}
