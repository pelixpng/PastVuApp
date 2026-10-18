import { useLayoutEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { RouteProp, useNavigation, useRoute, useTheme } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { StackParamList } from '../../../navigation/stackParams.types'
import { SCREENS } from '../../../navigation/navigation.types'
import { CompareView } from '../../../../core/components/compare/CompareView'
import { HeaderIconButton } from '../../../../core/components/ui/buttons/HeaderIconButton'
import ColorizeStore from '../../../../core/store/Colorize.store'
import { t } from '../../../../core/i18n'

export const CompareScreen = observer(() => {
  const { params } = useRoute<RouteProp<StackParamList, typeof SCREENS.COMPARE>>()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const colorized = ColorizeStore.isColorized(params.cid)
  const colorizing = ColorizeStore.isColorizing(params.cid)
  const canColorize = ColorizeStore.canColorize(params.cid)

  // The same palette button as in the post, also only on black-and-white photos: the colour
  // version shows here and there alike.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        colorizing ? (
          <View style={s.spinner}>
            <ActivityIndicator color={colors.textFirst} />
          </View>
        ) : canColorize ? (
          <View style={s.header}>
            <HeaderIconButton
              name="palette"
              color={colorized ? colors.basePrimary : colors.textFirst}
              onPress={() => ColorizeStore.toggle(params.cid, params.photo.uri)}
              accessibilityLabel={colorized ? t('colorize.original') : t('colorize.start')}
            />
          </View>
        ) : null,
    })
  }, [colorized, colorizing, canColorize, colors, navigation, params.cid, params.photo.uri])

  return (
    <View style={s.container}>
      <CompareView
        // The phone's view of the colour version, marked as in the post, so the collage is too.
        photo={{ ...params.photo, uri: ColorizeStore.displayUriFor(params.cid, params.photo.uri) }}
        initialMode={params.mode}
        target={params.target}
        panoramaYear={params.year}
        colorizing={colorizing}
      />
    </View>
  )
})

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  // 44 pt boxes around 24 pt glyphs: 6 keeps the glyph 16 from the edge, as on the post.
  header: { marginRight: 6 },
  spinner: { width: 44, height: 44, marginRight: 6, justifyContent: 'center', alignItems: 'center' },
})
