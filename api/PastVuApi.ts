import { getPhotoList, itemPhotoArray } from "../types/api";

export default class ApiServiceV2 {
    static async getAllGroups(latitude: number, longitude: number) {
        //const response = await fetch("https://pastvu.com/api2?method=photo.giveNearestPhotos&params={%22geo%22:[55.478322,%2060.221164],%22limit%22:12}");
        const response = await fetch(`https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${latitude},${longitude}],"limit":12}`);
        const json = await response.json() as getPhotoList;
        let photoArray: itemPhotoArray[] = [];
        for (let i = 0; i < json.result.photos.length ; i++) {
            photoArray.push({
                title: json.result.photos[i].title,
                location: {latitude: json.result.photos[i].geo[0], longitude: json.result.photos[i].geo[1]}
            }) 
        }
        //console.log(photoArray[0].title)
        return photoArray;
    }
}