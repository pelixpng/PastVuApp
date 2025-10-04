import { Direction } from '../types/components'

export const getMarker = (year: number, direction: Direction | undefined) => {
  if (direction == 'aero' || '' || undefined) {
    if (year <= 1840)
      return [
        require('../../assets/mapMarkers/Dot-pin-1840-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1840-night.png'),
      ]
    else if (year <= 1850)
      return [
        require('../../assets/mapMarkers/Dot-pin-1850-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1850-night.png'),
      ]
    else if (year <= 1860)
      return [
        require('../../assets/mapMarkers/Dot-pin-1860-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1860-night.png'),
      ]
    else if (year <= 1870)
      return [
        require('../../assets/mapMarkers/Dot-pin-1870-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1870-night.png'),
      ]
    else if (year <= 1880)
      return [
        require('../../assets/mapMarkers/Dot-pin-1880-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1880-night.png'),
      ]
    else if (year <= 1890)
      return [
        require('../../assets/mapMarkers/Dot-pin-1890-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1890-night.png'),
      ]
    else if (year <= 1895)
      return [
        require('../../assets/mapMarkers/Dot-pin-1895-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1895-night.png'),
      ]
    else if (year <= 1900)
      return [
        require('../../assets/mapMarkers/Dot-pin-1900-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1900-night.png'),
      ]
    else if (year <= 1905)
      return [
        require('../../assets/mapMarkers/Dot-pin-1905-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1905-night.png'),
      ]
    else if (year <= 1915)
      return [
        require('../../assets/mapMarkers/Dot-pin-1915-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1915-night.png'),
      ]
    else if (year <= 1920)
      return [
        require('../../assets/mapMarkers/Dot-pin-1920-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1920-night.png'),
      ]
    else if (year <= 1930)
      return [
        require('../../assets/mapMarkers/Dot-pin-1930-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1930-night.png'),
      ]
    else if (year <= 1940)
      return [
        require('../../assets/mapMarkers/Dot-pin-1940-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1940-night.png'),
      ]
    else if (year <= 1950)
      return [
        require('../../assets/mapMarkers/Dot-pin-1950-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1950-night.png'),
      ]
    else if (year <= 1955)
      return [
        require('../../assets/mapMarkers/Dot-pin-1955-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1955-night.png'),
      ]
    else if (year <= 1960)
      return [
        require('../../assets/mapMarkers/Dot-pin-1960-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1960-night.png'),
      ]
    else if (year <= 1965)
      return [
        require('../../assets/mapMarkers/Dot-pin-1965-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1965-night.png'),
      ]
    else if (year <= 1970)
      return [
        require('../../assets/mapMarkers/Dot-pin-1970-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1970-night.png'),
      ]
    else if (year <= 1975)
      return [
        require('../../assets/mapMarkers/Dot-pin-1975-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1975-night.png'),
      ]
    else if (year <= 1980)
      return [
        require('../../assets/mapMarkers/Dot-pin-1980-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1980-night.png'),
      ]
    else if (year <= 1990)
      return [
        require('../../assets/mapMarkers/Dot-pin-1990-day.png'),
        require('../../assets/mapMarkers/Dot-pin-1990-night.png'),
      ]
    else if (year <= 2000)
      return [
        require('../../assets/mapMarkers/Dot-pin-2000-day.png'),
        require('../../assets/mapMarkers/Dot-pin-2000-night.png'),
      ]
    else
      return [
        require('../../assets/mapMarkers/Dot-pin-2000-day.png'),
        require('../../assets/mapMarkers/Dot-pin-2000-night.png'),
      ]
  } else {
    if (year <= 1840)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1840-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1840-night.png'),
      ]
    else if (year <= 1850)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1850-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1850-night.png'),
      ]
    else if (year <= 1860)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1860-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1860-night.png'),
      ]
    else if (year <= 1870)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1870-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1870-night.png'),
      ]
    else if (year <= 1880)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1880-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1880-night.png'),
      ]
    else if (year <= 1890)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1890-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1890-night.png'),
      ]
    else if (year <= 1895)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1895-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1895-night.png'),
      ]
    else if (year <= 1900)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1900-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1900-night.png'),
      ]
    else if (year <= 1905)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1905-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1905-night.png'),
      ]
    else if (year <= 1915)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1915-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1915-night.png'),
      ]
    else if (year <= 1920)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1920-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1920-night.png'),
      ]
    else if (year <= 1930)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1930-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1930-night.png'),
      ]
    else if (year <= 1940)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1940-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1940-night.png'),
      ]
    else if (year <= 1950)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1950-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1950-night.png'),
      ]
    else if (year <= 1955)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1955-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1955-night.png'),
      ]
    else if (year <= 1960)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1960-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1960-night.png'),
      ]
    else if (year <= 1965)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1965-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1965-night.png'),
      ]
    else if (year <= 1970)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1970-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1970-night.png'),
      ]
    else if (year <= 1975)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1975-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1975-night.png'),
      ]
    else if (year <= 1980)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1980-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1980-night.png'),
      ]
    else if (year <= 1990)
      return [
        require('../../assets/mapMarkers/Arrow-pin-1990-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-1990-night.png'),
      ]
    else if (year <= 2000)
      return [
        require('../../assets/mapMarkers/Arrow-pin-2000-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-2000-night.png'),
      ]
    else
      return [
        require('../../assets/mapMarkers/Arrow-pin-2000-day.png'),
        require('../../assets/mapMarkers/Arrow-pin-2000-night.png'),
      ]
  }
}

export const getMarkerCluster = (count: number) => {
  if (count === 2)
    return [
      require('../../assets/mapMarkers/Cluster-2-day.png'),
      require('../../assets/mapMarkers/Cluster-2-night.png'),
    ]
  else if (count < 10)
    return [
      require('../../assets/mapMarkers/Cluster-2-plus-day.png'),
      require('../../assets/mapMarkers/Cluster-2-plus-night.png'),
    ]
  else if (count < 100)
    return [
      require('../../assets/mapMarkers/Cluster-10-plus-day.png'),
      require('../../assets/mapMarkers/Cluster-10-plus-night.png'),
    ]
  else if (count < 500)
    return [
      require('../../assets/mapMarkers/Cluster-100-plus-day.png'),
      require('../../assets/mapMarkers/Cluster-100-plus-night.png'),
    ]
  else if (count < 999)
    return [
      require('../../assets/mapMarkers/Cluster-500-plus-day.png'),
      require('../../assets/mapMarkers/Cluster-500-plus-night.png'),
    ]
  else
    return [
      require('../../assets/mapMarkers/Cluster-999-day.png'),
      require('../../assets/mapMarkers/Cluster-999-night.png'),
    ]
}
