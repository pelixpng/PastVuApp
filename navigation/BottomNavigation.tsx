import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MapComponent } from '../screens/MapView';
import { SettingsComponent } from '../screens/Settings';
import { BottomRoutes } from './Routes';
import { SettingsNavigation } from './SettingsNavigation';

const Tab = createBottomTabNavigator();

export function BottomNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={BottomRoutes.MapComponent} component={MapComponent} options={{
                    headerShown: false
                }}/>
      <Tab.Screen name={BottomRoutes.SettingsComponent} component={SettingsNavigation} />
    </Tab.Navigator>
  );
}