import { FC } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'

export type SegmentedControlOption = {
  label: string
  value: string
}

type SegmentedControlProps = {
  options: SegmentedControlOption[]
  selectedValue: string
  onChange: (value: string) => void
}

export const SegmentedControl: FC<SegmentedControlProps> = ({ options, selectedValue, onChange }) => {
  const { colors } = useTheme()

  return (
    <View style={[s.container, { backgroundColor: colors.baseSecond }]}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              s.segment,
              isSelected && [s.segmentSelected, { backgroundColor: colors.backgroundApp }],
              isFirst && s.segmentFirst,
              isLast && s.segmentLast,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}>
            <Text
              style={[
                s.segmentText,
                { color: colors.textSecond },
                isSelected && [s.segmentTextSelected, { color: colors.textFirst }],
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentFirst: {},
  segmentLast: {},
  segmentSelected: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  segmentTextSelected: {
    fontWeight: '600',
  },
})
