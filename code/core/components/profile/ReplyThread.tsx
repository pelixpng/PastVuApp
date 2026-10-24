import { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { CustomTheme } from '../theme/Theme'

/** Where the line runs: the centre of the 80 pt thumbnail in the photo row above. */
export const THREAD_X = 40
export const THREAD_WIDTH = 2
// A comment's avatar is 40 pt; the line turns into it at its centre.
const AVATAR_CENTER = 20
const RADIUS = 12

/** Solid rather than translucent: the straight part and the turn overlap where they meet. */
export const useThreadColor = () => {
  const theme = useTheme() as CustomTheme
  return theme.names?.themeName === 'dark' ? theme.colors.baseFourth : '#D9DAE0'
}

/**
 * The line from a photo to one of the comments under it, as in a reply thread: straight down on
 * the left, then a rounded turn towards the comment's avatar. Beside every comment but the last
 * it also runs on to the next one. Goes inside the comment's row, which must have no padding.
 */
export const ReplyThread: FC<{ last: boolean }> = ({ last }) => {
  const color = useThreadColor()
  return (
    <>
      {!last && <View style={[s.through, { backgroundColor: color }]} />}
      <View style={[s.turn, { borderColor: color }]} />
    </>
  )
}

const s = StyleSheet.create({
  through: {
    position: 'absolute',
    left: THREAD_X - THREAD_WIDTH / 2,
    top: AVATAR_CENTER - RADIUS,
    bottom: 0,
    width: THREAD_WIDTH,
  },
  turn: {
    position: 'absolute',
    left: THREAD_X - THREAD_WIDTH / 2,
    top: 0,
    height: AVATAR_CENTER + THREAD_WIDTH / 2,
    // Stops just short of the comment, which takes the right 80% of the row.
    right: '80%',
    marginRight: 6,
    borderLeftWidth: THREAD_WIDTH,
    borderBottomWidth: THREAD_WIDTH,
    borderBottomLeftRadius: RADIUS,
  },
})
