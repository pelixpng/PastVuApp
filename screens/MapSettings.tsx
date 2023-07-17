import { FC, SetStateAction, useState } from 'react'
import { Text, View } from 'react-native'
import { MenuContainer, ScrollContainer } from '../components/UniversalComponents'
import { InsideMenuComponent } from '../components/InsideMenuComponent'
import { SliderComponent } from '../components/SliderComponen'
import { Slider } from '@miblanchard/react-native-slider'
import { InsideMenuProps } from '../types/components.types'

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


export const MapSettings: FC = () => {
  const [distance, setDistance] = useState(5000);
  const [photos, setPhotos] = useState(20);
  return (
    <ScrollContainer>
      <InsideMenuComponent title={InsideMenuText[0].title} discription={InsideMenuText[0].discription} child={<SliderComponent title='Максимальное растояние в метрах' maxValue={10000} minValue={0} value={distance} setValue={setDistance}/>}  child2={<SliderComponent value={photos} setValue={setPhotos} title={'Максимальное количество фото'} minValue={0} maxValue={30}/>}/>
      <InsideMenuComponent title={InsideMenuText[1].title} discription={InsideMenuText[1].discription}/>
    </ScrollContainer>
    
  )
}

