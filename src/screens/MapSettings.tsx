import { FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { MenuContainer, ScrollContainer } from '../components/UniversalComponents'
import { InsideMenuComponent } from '../components/InsideMenuComponent'
import { SliderComponent } from '../components/SliderComponen'
import { Slider } from '@miblanchard/react-native-slider'
import { InsideMenuProps } from '../types/components.types'
import apiStore from '../mobxStore/apiStore'
import { observer } from 'mobx-react-lite'
import { RadioButtonComponent } from '../components/RadioButtonComponent'
import StorageServiceMMKV, { Storage } from '../Storage/Storage'

const InsideMenuText: InsideMenuProps[] = [
  { 
    title: 'Параметры карты', 
    discription: 'Тут вы можете указать на каком маскиммальном растоянии от текущих координат искать фотографии. А также количество загружаемых фотографий при каждом изменении координат. Изменение этих настрек может повлиять на скорость работы приложения.' 
  },
  { 
    title: 'Тема', 
    discription: 'Настройка цветовой схемы приложения' 
  }
];


export const MapSettings: FC = observer(() => {
  
  const {countPhoto, changeCountPhoto, maxDistance, changeDistancePhoto} = apiStore;
  
  return (
    
    <ScrollContainer>
      <InsideMenuComponent title={InsideMenuText[0].title} discription={InsideMenuText[0].discription} CustomComponent={<SliderComponent title='Максимальное растояние в метрах' maxValue={10000} minValue={0} value={maxDistance} setValue={changeDistancePhoto}/>}  CustomComponent2={<SliderComponent value={countPhoto} setValue={changeCountPhoto} title={'Максимальное количество фото'} minValue={0} maxValue={30}/>}/>
      <InsideMenuComponent title={InsideMenuText[1].title} discription={InsideMenuText[1].discription} CustomComponent={<RadioButtonComponent/>}/>
    </ScrollContainer>
  )
})

