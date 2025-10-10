import 'react-native'
import CustomTheme from '../components/theme/Theme'

declare module '@react-navigation/native' {
  export function useTheme(): CustomTheme
}
