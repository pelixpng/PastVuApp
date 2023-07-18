import { makeAutoObservable, observable } from "mobx";

class ApiStore {
    countPhoto = 10;
    maxDistance = 8000;
    themeSettings = 'Системная';
    theme = '0';

    constructor(){
        makeAutoObservable(this)
    }

    changeCountPhoto = (value: number) => {
        this.countPhoto = value;
    }

    changeDistancePhoto = (value: number) => {
        this.maxDistance = value;
    }

    changeThemeSettings = (value: string) => {
        this.themeSettings = value;
    }

    changeTheme = (value: string) => {
        this.theme = value
    }
}

export default new ApiStore();