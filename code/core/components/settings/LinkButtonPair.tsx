import { FC } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { MyButton } from '../ui/buttons/MyButton'
import { Spacer } from '../ui/Spacer'

type LinkButton = { title: string; url: string }

type LinkButtonPairProps = {
  first: LinkButton
  second: LinkButton
  /** Side by side, sharing the width, where a full-width button would stretch too far (tablet). */
  wide?: boolean
}

/** Two buttons opening links: one under the other, or side by side when `wide`. */
export const LinkButtonPair: FC<LinkButtonPairProps> = ({ first, second, wide }) =>
  wide ? (
    <View style={s.row}>
      <MyButton fullWidth title={first.title} func={() => Linking.openURL(first.url)} />
      <MyButton fullWidth title={second.title} func={() => Linking.openURL(second.url)} />
    </View>
  ) : (
    <>
      <MyButton title={first.title} func={() => Linking.openURL(first.url)} />
      <Spacer height={16} />
      <MyButton title={second.title} func={() => Linking.openURL(second.url)} />
    </>
  )

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
})
