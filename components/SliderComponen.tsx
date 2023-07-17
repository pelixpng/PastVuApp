// import React, { useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import Slider from '@react-native-community/slider';

// export const SliderComponent: React.FC = () => {
//   const [distance, setDistance] = useState(0);

//   const handleSliderChange = (value: number) => {
//     setDistance(value);
//   }

//   return (
//     <View style={styles.container}>
//       {/* <Text style={styles.label}>Дистанция</Text>
//       <Text style={styles.value}>{distance}</Text>
//       <Slider
//         style={styles.slider}
//         minimumValue={0}
//         maximumValue={30}
//         step={1}
//         value={distance}
//         onValueChange={handleSliderChange}
//       />
//       <View style={styles.sliderLabels}>
//         <Text style={styles.label}>0</Text>
//         <Text style={styles.label}>30</Text>
//       </View> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   label: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   value: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginVertical: 20,
//   },
//   slider: {
//     width: '80%',
//   },
//   sliderLabels: {
//     width: '80%',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
// });
import styled from 'styled-components/native'
import { FC, useState } from 'react'
import { Text, View } from 'react-native'
import { perfectSize } from '../utils/ScreenSize'
import { Slider } from '@miblanchard/react-native-slider'
import { DefaultTheme, useTheme } from 'styled-components';

type SliderComponentProps = {
    value: number;
    //setValue: React.Dispatch<React.SetStateAction<number>>;
    setValue: (value: number) => void;
    title: string;
    minValue: number;
    maxValue:number
}



export const SliderComponent: FC<SliderComponentProps> = ({value, setValue, title, minValue, maxValue}) => {
  const theme: DefaultTheme = useTheme()
  return (
    <SliderContainer>
        <LabelTextContainer>
            <TitleSliderText>{title}</TitleSliderText>
            <TitleSliderText>{value.toString()}</TitleSliderText>
        </LabelTextContainer>
        <SliderBodyContainer>
            <Slider  minimumValue={minValue} maximumValue={maxValue} thumbStyle={{height: perfectSize(15), width: perfectSize(15)}} containerStyle={{height: perfectSize(25)}} thumbTintColor='#526ED3' animateTransitions={true} maximumTrackTintColor={theme.colors.SliderRangeBG} minimumTrackTintColor='#526ED3' value={value}  onValueChange={setValue} step={1}/>
        </SliderBodyContainer>
        <LabelTextContainer>
            <MinMaxRangeText>{minValue.toString()}</MinMaxRangeText>
            <MinMaxRangeText>{maxValue.toString()}</MinMaxRangeText>
        </LabelTextContainer>
    </SliderContainer>
  )
}

export const SliderContainer = styled.View`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: ${perfectSize(324)};
`
export const LabelTextContainer = styled.View`
    justify-content: space-between;
    align-items: flex-start;
    align-self: stretch;
    flex-direction: row;
`
export const TitleSliderText = styled.Text`
    font-size: ${perfectSize(14)};
    font-style: normal;
    font-weight: 500;
    line-height: ${perfectSize(20)};
    color: ${props => props.theme.colors.titleMenuText};
`

export const SliderBodyContainer = styled.View`
    width: 100%;
`
export const MinMaxRangeText = styled.Text`
    font-size: ${perfectSize(14)};
    font-style: normal;
    font-weight: 500;
    line-height: ${perfectSize(20)};
    color: ${props => props.theme.colors.MenuDescriptionText};
`