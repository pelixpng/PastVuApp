import { FC } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@react-navigation/native'

export type FilterChip = { value: string; label: string; count?: string }

type Props = {
  options: FilterChip[]
  selectedValue: string
  onChange: (value: string) => void
}

/** A lighter choice than the segmented control, for narrowing what a list already shows. */
export const FilterChips: FC<Props> = ({ options, selectedValue, onChange }) => {
  const { colors } = useTheme()
  return (
    <View style={s.row}>
      {options.map(option => {
        const selected = option.value === selectedValue
        const color = selected ? '#FFFFFF' : colors.textSecond
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[s.chip, { backgroundColor: selected ? colors.basePrimary : colors.baseFifth }]}>
            <Text style={[s.label, { color }]}>
              {option.label}
              {option.count !== undefined && (
                <Text style={s.count}>
                  {'  '}
                  {option.count}
                </Text>
              )}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  count: { opacity: 0.7 },
})
