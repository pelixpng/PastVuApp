
import { getPhotoList } from "../types/apiPhotoList";
import { Root } from "../types/apiPhotoInfo";

export default class ApiServiceV2 {
    static async getAllGroups(latitude: number, longitude: number, limit: number, distance: number, yearStart: number, yearEnd: number) {
        const response = await fetch(`https://pastvu.com/api2?method=photo.giveNearestPhotos&params={"geo":[${latitude},${longitude}],"limit":${limit},"distance":${distance},"year":${yearStart},"year2":${yearEnd}}`);
        const json = await response.json() as getPhotoList;
        let photoArray: itemPhotoArray[] = [];
        for (let i = 0; i < json.result.photos.length ; i++) {
            photoArray.push({
                title: json.result.photos[i].title,
                location: {latitude: json.result.photos[i].geo[0], longitude: json.result.photos[i].geo[1]},
                cid: json.result.photos[i].cid.toString()
            }) 
        }
        return photoArray;
    }

    static async getPhotoInfo(cid: string){
        const response = await fetch(`https://pastvu.com/api2?method=photo.giveForPage&params={"cid":${cid}}`);
        const json = await response.json() as Root;
        const photoUrl = json.result.photo.file
        return "https://pastvu.com/_p/d/"+photoUrl;
    }

}