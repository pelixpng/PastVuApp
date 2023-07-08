import React, { useEffect, useState } from 'react';
import { MapComponent } from './screens/MapView';
import { StartNavigator } from './navigation/StartNavigation';
import { BottomNavigator } from './navigation/BottomNavigation';

export default function App() {
  return (
    // <MapComponent/>
    <StartNavigator/>
  );
}
