import 'react-native'
import type { CustomTheme } from '../components/theme/Theme'

declare module '@react-navigation/native' {
  export function useTheme(): CustomTheme
}
