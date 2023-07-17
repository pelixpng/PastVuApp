import { makeAutoObservable } from "mobx";

class ApiStore {
    countPhoto = 10;
    maxDistance = 8000;

    constructor(){
        makeAutoObservable(this)
    }

    changeCountPhoto = (value: number) => {
        this.countPhoto = value;
    }

    changeDistancePhoto = (value: number) => {
        this.maxDistance = value;
    }
}

export default new ApiStore();