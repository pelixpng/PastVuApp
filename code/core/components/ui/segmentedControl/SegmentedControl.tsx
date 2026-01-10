import { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated'

export type SegmentedControlOption = {
  label: string
  value: string
}

type SegmentedControlProps = {
  options: SegmentedControlOption[]
  selectedValue: string
  onChange: (value: string) => void
}

export const SegmentedControl: FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  const { colors } = useTheme()
  const [segmentWidth, setSegmentWidth] = useState(0)
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue)
  const translateX = useSharedValue(0)

  useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(selectedIndex * (segmentWidth + 6), {
        damping: 20,
        stiffness: 150,
      })
    }
  }, [selectedIndex, segmentWidth, translateX])

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    const itemWidth = (width - 6 * (options.length + 1)) / options.length
    setSegmentWidth(itemWidth)
  }

  return (
    <View style={[s.container, { backgroundColor: colors.baseThird }]} onLayout={handleLayout}>
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            s.indicator,
            {
              width: segmentWidth,
              backgroundColor: colors.backgroundApp,
            },
            animatedIndicatorStyle,
          ]}
        />
      )}
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <SegmentItem
            key={option.value}
            option={option}
            isSelected={isSelected}
            isFirst={isFirst}
            isLast={isLast}
            colors={colors}
            onChange={onChange}
          />
        )
      })}
    </View>
  )
}

type SegmentItemProps = {
  option: SegmentedControlOption
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  colors: any
  onChange: (value: string) => void
}

const SegmentItem: FC<SegmentItemProps> = ({
  option,
  isSelected,
  isFirst,
  isLast,
  colors,
  onChange,
}) => {
  const animation = useSharedValue(0)

  useEffect(() => {
    animation.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    })
  }, [isSelected, animation])

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animation.value,
      [0, 1],
      [colors.textSecond, colors.textFirst],
    )

    return { color }
  })

  return (
    <TouchableOpacity
      style={[s.segment, isFirst && s.segmentFirst, isLast && s.segmentLast]}
      onPress={() => onChange(option.value)}
      activeOpacity={0.7}>
      <Animated.Text
        style={[s.segmentText, isSelected && s.segmentTextSelected, animatedTextStyle]}>
        {option.label}
      </Animated.Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    gap: 6,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  segmentBackground: {
    borderRadius: 12,
  },
  segmentFirst: {},
  segmentLast: {},
  segmentSelected: {},
  segmentText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  segmentTextSelected: {
    fontWeight: '600',
  },
})
