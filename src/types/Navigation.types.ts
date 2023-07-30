import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Root } from './apiPhotoInfo';

export type RootStackParamList = {
    MapComponent: undefined;
    ErrorLoad: undefined;
    PhotoPage: {PhotoJson: Root};
  };

  export type MapScreenNavigationProp = NativeStackScreenProps<RootStackParamList, 'MapComponent'>;

  export type Propss = {
    navigation: MapScreenNavigationProp;
  };


  export type SettingsScreenNavigationProp = NativeStackScreenProps<SettingsStackParamList, 'SettingsComponent'>;

  export type SettingsStackParamList = {
    AppInfo: undefined;
    ChangeTheme: undefined;
    FeedBack: undefined;
    SettingsComponent: undefined;
    MapSettings: undefined;
  };