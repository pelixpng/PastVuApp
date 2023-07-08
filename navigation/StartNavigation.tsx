import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation.types'
import { createStackNavigator } from '@react-navigation/stack'
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo'
import { StartRoutes } from './Routes';
import { MapComponent } from '../screens/MapView';
import { ErrorLoad } from '../screens/Error';
import { PhotoPage } from '../screens/PhotoView';

const Stack = createStackNavigator<RootStackParamList>()

export function StartNavigator() {
  const internetState: NetInfoState = useNetInfo()
  return (
    <NavigationContainer>
        <Stack.Navigator 
            initialRouteName={internetState.isConnected ? StartRoutes.ErrorLoad : StartRoutes.MapComponent}
            // screenOptions={{ presentation: 'transparentModal' }}
        >
            <Stack.Screen 
                name={StartRoutes.MapComponent}
                component={MapComponent}
            />
            <Stack.Screen 
                name={StartRoutes.ErrorLoad}
                component={ErrorLoad}
            />
            <Stack.Screen 
                name={StartRoutes.PhotoPage}
                component={PhotoPage}
            />
        </Stack.Navigator>
    </NavigationContainer>
  );
}