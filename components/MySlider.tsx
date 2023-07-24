import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder, LayoutChangeEvent } from 'react-native';

interface RangeSliderProps {
  min: number;
  max: number;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max }) => {
  const [value1, setValue1] = useState(min);
  const [value2, setValue2] = useState(max);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [minPosition, setMinPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(0);
  const [minSliderX, setMinSliderX] = useState(0);
  const [maxSliderX, setMaxSliderX] = useState(0);
  const panResponder1 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Обработчик начала перетаскивания первого ползунка
      },
      onPanResponderMove: (_, { dx }) => {
        // Обработчик движения первого ползунка
        const newPosition = minSliderX + dx;
        handleValueChange1(newPosition);
      },
      onPanResponderRelease: () => {
        // Обработчик отпускания первого ползунка
      },
    })
  ).current;
  const panResponder2 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Обработчик начала перетаскивания второго ползунка
      },
      onPanResponderMove: (_, { dx }) => {
        // Обработчик движения второго ползунка
        const newPosition = maxSliderX + dx;
        handleValueChange2(newPosition);
      },
      onPanResponderRelease: () => {
        // Обработчик отпускания второго ползунка
      },
    })
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    // Обновляем ширину слайдера при изменении его размера
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const handleValueChange1 = (newPosition: number) => {
    // Обновляем значение первого ползунка при его перемещении
    const newValue = Math.round(
      ((newPosition - minPosition) / (maxPosition - minPosition)) * (max - min) + min
    );
    setValue1(newValue);
    setMinSliderX(newPosition);
  };

  const handleValueChange2 = (newPosition: number) => {
    // Обновляем значение второго ползунка при его перемещении
    const newValue = Math.round(
      ((newPosition - minPosition) / (maxPosition - minPosition)) * (max - min) + min
    );
    setValue2(newValue);
    setMaxSliderX(newPosition);
  };

  return (
    <View>
      <View style={{ backgroundColor: '#ccc', height: 10 }} onLayout={handleLayout}>
        <View
          style={{
            backgroundColor: 'blue',
            height: 10,
            position: 'absolute',
            left: minSliderX,
            width: maxSliderX - minSliderX,
          }}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: minSliderX,
            marginLeft: -10,
            height: 30,
            width: 30,
            borderRadius: 15,
            backgroundColor: 'blue',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
          {...panResponder1.panHandlers}
        >
          <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: 'white' }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: maxSliderX,
            marginLeft: -10,
            height: 30,
            width: 30,
            borderRadius: 15,
            backgroundColor: 'blue',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
          {...panResponder2.panHandlers}
        >
          <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: 'white' }} />
        </TouchableOpacity>
        </View>
      <Text>Value 1: {value1}</Text>
      <Text>Value 2: {value2}</Text>
    </View>
  );
};

