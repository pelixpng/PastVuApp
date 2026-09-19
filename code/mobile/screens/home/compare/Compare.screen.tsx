import { StyleSheet, View } from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'
import { StackParamList } from '../../../navigation/stackParams.types'
import { SCREENS } from '../../../navigation/navigation.types'
import { CompareView } from '../../../../core/components/compare/CompareView'

export const CompareScreen = () => {
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.COMPARE>>()
  return (
    <View style={s.container}>
      <CompareView
        photo={params.photo}
        initialMode={params.mode}
        target={params.target}
        panoramaYear={params.year}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
})
