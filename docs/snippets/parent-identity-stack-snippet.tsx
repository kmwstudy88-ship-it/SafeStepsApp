import { createStackNavigator } from '@react-navigation/stack';
import IdentityCoreScreen from './src/screens/parents/identity/IdentityCoreScreen';

const Stack = createStackNavigator();

<Stack.Screen
  name="IdentityCore"
  component={IdentityCoreScreen}
/>
