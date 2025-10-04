import { Direction } from './components'

interface LocationItem {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface PhotoList {
  result: Result
  rid: string
}

interface Result {
  photos: Photo[]
}

interface Photo {
  cid: number
  file: string
  s: number
  year: number
  title: string
  dir?: Direction
  geo: number[]
  ccount?: number
}

type getPhotoListProps = {
  latitude: number
  longitude: number
  limit?: number
  distance?: number
  yearStart: number
  yearEnd: number
}

type getClustersPhotosProps = {
  polygon: number[[]]
  latitude: number
  longitude: number
  yearStart: number
  yearEnd: number
  zoom: number
}

interface clusterResponse {
  result: {
    clusters: Cluster[]
    photos: Photo[]
  }
}

interface Cluster {
  c: number
  geo: number[]
}

type itemPhotoCluster = {
  clusters: itemClusterPhotoArray[]
  photos: itemPhotoArray[]
}

type itemClusterPhotoArray = {
  count: number
  marker: any[]
  location: {
    latitude: number
    longitude: number
  }
}

type itemPhotoArray = {
  year: number
  title: string
  cid: string
  location: {
    latitude: number
    longitude: number
  }
  dir: number
  marker: any[]
  color: string
}
