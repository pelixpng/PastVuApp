import { makeAutoObservable, observable } from "mobx";
import StorageServiceMMKV, { Storage } from "../Storage/Storage";
import { useColorScheme } from 'react-native';

// const getColorScheme = () => {
//     const SavethemeSettings = Storage.getString('theme')
//     if (SavethemeSettings == 'Тёмная') {
//     changeThemeSettings(SavethemeSettings)
//     changeTheme('dark')
//     } else if (SavethemeSettings == 'Светлая') {
//     changeThemeSettings(SavethemeSettings)
//     changeTheme('light')
//     } else {
//         changeThemeSettings('Системная')
//         if (colorScheme != null && colorScheme != undefined) {
//     changeTheme(colorScheme)
//         } else {
//     changeTheme('light')
//         }
//     }
// }




class ApiStore {
    countPhoto = Storage.getNumber('countPhoto') ?  Storage.getNumber('countPhoto') : 15;
    maxDistance = Storage.getNumber('MaxDistance') ?  Storage.getNumber('MaxDistance') : 8000;
    themeSettings = Storage.getString('theme') ? Storage.getString('theme') : 'Системная';
    theme = '0'

    constructor(){
        makeAutoObservable(this)
    }

    changeCountPhoto = (value: number) => {
        this.countPhoto = value;
        StorageServiceMMKV.saveApiCountPhoto(value[0]);
    }

    changeDistancePhoto = (value: number) => {
        this.maxDistance = value;
        StorageServiceMMKV.saveApiMaxDistance(value[0])
    }

    changeThemeSettings = (value: string) => {
        this.themeSettings = value;
        value != 'Системная' && this.changeTheme(value);
        StorageServiceMMKV.saveThemeSettings(value);
    }

    changeTheme = (value: string) => {
        this.theme = value
    }
}

export default new ApiStore();