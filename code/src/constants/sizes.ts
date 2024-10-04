import { Dimensions } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'

export const INSET_TOP = initialWindowMetrics?.insets.top ?? 25
export const WIDTH = Dimensions.get('screen').width
export const HEIGHT = Dimensions.get('screen').height
