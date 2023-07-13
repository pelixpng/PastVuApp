import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MapComponent } from '../screens/MapView';
import { SettingsComponent } from '../screens/Settings';
import { BottomRoutes } from './Routes';
import { SettingsNavigation } from './SettingsNavigation';
import { DefaultTheme, useTheme } from 'styled-components';
import { perfectSize } from '../utils/ScreenSize'
import { Feather } from '@expo/vector-icons'; 


const Tab = createBottomTabNavigator();

export function BottomNavigator() {
  const theme: DefaultTheme = useTheme()
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: theme.colors.tabBarActiveTint,
      tabBarInactiveTintColor: theme.colors.tabBarInactiveTintColor,
      
      tabBarStyle: {
        backgroundColor: theme.colors.backgroundApp,
        height: perfectSize(60)
    }}
    
    }>
      <Tab.Screen name={BottomRoutes.MapComponent} component={MapComponent} options={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    title: 'Карта',
                    tabBarLabelStyle: {fontSize: perfectSize(13), fontStyle: 'normal', fontWeight: '500', lineHeight: perfectSize(24) },
                    tabBarIcon: ({ color }) => (
                      <Feather name="map" size={perfectSize(24)} color={color} />
                    )
                }}/>
      <Tab.Screen name={BottomRoutes.SettingsComponent} component={SettingsNavigation} options={{
                    headerShown: false,
                    tabBarShowLabel: true,
                    title: 'Карта',
                    tabBarLabelStyle: {fontSize: perfectSize(13), fontStyle: 'normal', fontWeight: '500', lineHeight: perfectSize(24) },
                    tabBarIcon: ({ color }) => (
                      <Feather name="settings" size={perfectSize(24)} color={color} />
                    )
                }}/>
    </Tab.Navigator>
  );
}