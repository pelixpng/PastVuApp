import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    MapComponent: undefined;
    ErrorLoad: undefined;
    PhotoPage: {url: string};
  };

  export type MapScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'MapComponent'>;

  export type Propss = {
    navigation: MapScreenNavigationProp;
  };