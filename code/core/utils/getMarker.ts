import { Direction } from '../types/components'

export const getMarker = (year: number, direction: Direction | undefined) => {
  if (direction == 'aero' || '' || undefined) {
    if (year <= 1840)
      return [
        require('../../assets/mapMarkers/dotpin1840day.png'),
        require('../../assets/mapMarkers/dotpin1840night.png'),
      ]
    else if (year <= 1850)
      return [
        require('../../assets/mapMarkers/dotpin1850day.png'),
        require('../../assets/mapMarkers/dotpin1850night.png'),
      ]
    else if (year <= 1860)
      return [
        require('../../assets/mapMarkers/dotpin1860day.png'),
        require('../../assets/mapMarkers/dotpin1860night.png'),
      ]
    else if (year <= 1870)
      return [
        require('../../assets/mapMarkers/dotpin1870day.png'),
        require('../../assets/mapMarkers/dotpin1870night.png'),
      ]
    else if (year <= 1880)
      return [
        require('../../assets/mapMarkers/dotpin1880day.png'),
        require('../../assets/mapMarkers/dotpin1880night.png'),
      ]
    else if (year <= 1890)
      return [
        require('../../assets/mapMarkers/dotpin1890day.png'),
        require('../../assets/mapMarkers/dotpin1890night.png'),
      ]
    else if (year <= 1895)
      return [
        require('../../assets/mapMarkers/dotpin1895day.png'),
        require('../../assets/mapMarkers/dotpin1895night.png'),
      ]
    else if (year <= 1900)
      return [
        require('../../assets/mapMarkers/dotpin1900day.png'),
        require('../../assets/mapMarkers/dotpin1900night.png'),
      ]
    else if (year <= 1905)
      return [
        require('../../assets/mapMarkers/dotpin1905day.png'),
        require('../../assets/mapMarkers/dotpin1905night.png'),
      ]
    else if (year <= 1915)
      return [
        require('../../assets/mapMarkers/dotpin1915day.png'),
        require('../../assets/mapMarkers/dotpin1915night.png'),
      ]
    else if (year <= 1920)
      return [
        require('../../assets/mapMarkers/dotpin1920day.png'),
        require('../../assets/mapMarkers/dotpin1920night.png'),
      ]
    else if (year <= 1930)
      return [
        require('../../assets/mapMarkers/dotpin1930day.png'),
        require('../../assets/mapMarkers/dotpin1930night.png'),
      ]
    else if (year <= 1940)
      return [
        require('../../assets/mapMarkers/dotpin1940day.png'),
        require('../../assets/mapMarkers/dotpin1940night.png'),
      ]
    else if (year <= 1950)
      return [
        require('../../assets/mapMarkers/dotpin1950day.png'),
        require('../../assets/mapMarkers/dotpin1950night.png'),
      ]
    else if (year <= 1955)
      return [
        require('../../assets/mapMarkers/dotpin1955day.png'),
        require('../../assets/mapMarkers/dotpin1955night.png'),
      ]
    else if (year <= 1960)
      return [
        require('../../assets/mapMarkers/dotpin1960day.png'),
        require('../../assets/mapMarkers/dotpin1960night.png'),
      ]
    else if (year <= 1965)
      return [
        require('../../assets/mapMarkers/dotpin1965day.png'),
        require('../../assets/mapMarkers/dotpin1965night.png'),
      ]
    else if (year <= 1970)
      return [
        require('../../assets/mapMarkers/dotpin1970day.png'),
        require('../../assets/mapMarkers/dotpin1970night.png'),
      ]
    else if (year <= 1975)
      return [
        require('../../assets/mapMarkers/dotpin1975day.png'),
        require('../../assets/mapMarkers/dotpin1975night.png'),
      ]
    else if (year <= 1980)
      return [
        require('../../assets/mapMarkers/dotpin1980day.png'),
        require('../../assets/mapMarkers/dotpin1980night.png'),
      ]
    else if (year <= 1990)
      return [
        require('../../assets/mapMarkers/dotpin1990day.png'),
        require('../../assets/mapMarkers/dotpin1990night.png'),
      ]
    else if (year <= 2000)
      return [
        require('../../assets/mapMarkers/dotpin2000day.png'),
        require('../../assets/mapMarkers/dotpin2000night.png'),
      ]
    else
      return [
        require('../../assets/mapMarkers/dotpin2000day.png'),
        require('../../assets/mapMarkers/dotpin2000night.png'),
      ]
  } else {
    if (year <= 1840)
      return [
        require('../../assets/mapMarkers/arrowpin1840day.png'),
        require('../../assets/mapMarkers/arrowpin1840night.png'),
      ]
    else if (year <= 1850)
      return [
        require('../../assets/mapMarkers/arrowpin1850day.png'),
        require('../../assets/mapMarkers/arrowpin1850night.png'),
      ]
    else if (year <= 1860)
      return [
        require('../../assets/mapMarkers/arrowpin1860day.png'),
        require('../../assets/mapMarkers/arrowpin1860night.png'),
      ]
    else if (year <= 1870)
      return [
        require('../../assets/mapMarkers/arrowpin1870day.png'),
        require('../../assets/mapMarkers/arrowpin1870night.png'),
      ]
    else if (year <= 1880)
      return [
        require('../../assets/mapMarkers/arrowpin1880day.png'),
        require('../../assets/mapMarkers/arrowpin1880night.png'),
      ]
    else if (year <= 1890)
      return [
        require('../../assets/mapMarkers/arrowpin1890day.png'),
        require('../../assets/mapMarkers/arrowpin1890night.png'),
      ]
    else if (year <= 1895)
      return [
        require('../../assets/mapMarkers/arrowpin1895day.png'),
        require('../../assets/mapMarkers/arrowpin1895night.png'),
      ]
    else if (year <= 1900)
      return [
        require('../../assets/mapMarkers/arrowpin1900day.png'),
        require('../../assets/mapMarkers/arrowpin1900night.png'),
      ]
    else if (year <= 1905)
      return [
        require('../../assets/mapMarkers/arrowpin1905day.png'),
        require('../../assets/mapMarkers/arrowpin1905night.png'),
      ]
    else if (year <= 1915)
      return [
        require('../../assets/mapMarkers/arrowpin1915day.png'),
        require('../../assets/mapMarkers/arrowpin1915night.png'),
      ]
    else if (year <= 1920)
      return [
        require('../../assets/mapMarkers/arrowpin1920day.png'),
        require('../../assets/mapMarkers/arrowpin1920night.png'),
      ]
    else if (year <= 1930)
      return [
        require('../../assets/mapMarkers/arrowpin1930day.png'),
        require('../../assets/mapMarkers/arrowpin1930night.png'),
      ]
    else if (year <= 1940)
      return [
        require('../../assets/mapMarkers/arrowpin1940day.png'),
        require('../../assets/mapMarkers/arrowpin1940night.png'),
      ]
    else if (year <= 1950)
      return [
        require('../../assets/mapMarkers/arrowpin1950day.png'),
        require('../../assets/mapMarkers/arrowpin1950night.png'),
      ]
    else if (year <= 1955)
      return [
        require('../../assets/mapMarkers/arrowpin1955day.png'),
        require('../../assets/mapMarkers/arrowpin1955night.png'),
      ]
    else if (year <= 1960)
      return [
        require('../../assets/mapMarkers/arrowpin1960day.png'),
        require('../../assets/mapMarkers/arrowpin1960night.png'),
      ]
    else if (year <= 1965)
      return [
        require('../../assets/mapMarkers/arrowpin1965day.png'),
        require('../../assets/mapMarkers/arrowpin1965night.png'),
      ]
    else if (year <= 1970)
      return [
        require('../../assets/mapMarkers/arrowpin1970day.png'),
        require('../../assets/mapMarkers/arrowpin1970night.png'),
      ]
    else if (year <= 1975)
      return [
        require('../../assets/mapMarkers/arrowpin1975day.png'),
        require('../../assets/mapMarkers/arrowpin1975night.png'),
      ]
    else if (year <= 1980)
      return [
        require('../../assets/mapMarkers/arrowpin1980day.png'),
        require('../../assets/mapMarkers/arrowpin1980night.png'),
      ]
    else if (year <= 1990)
      return [
        require('../../assets/mapMarkers/arrowpin1990day.png'),
        require('../../assets/mapMarkers/arrowpin1990night.png'),
      ]
    else if (year <= 2000)
      return [
        require('../../assets/mapMarkers/arrowpin2000day.png'),
        require('../../assets/mapMarkers/arrowpin2000night.png'),
      ]
    else
      return [
        require('../../assets/mapMarkers/arrowpin2000day.png'),
        require('../../assets/mapMarkers/arrowpin2000night.png'),
      ]
  }
}

export const getMarkerCluster = (count: number) => {
  if (count === 2)
    return [
      require('../../assets/mapMarkers/cluster2day.png'),
      require('../../assets/mapMarkers/cluster2night.png'),
    ]
  else if (count < 10)
    return [
      require('../../assets/mapMarkers/cluster2plusday.png'),
      require('../../assets/mapMarkers/cluster2plusnight.png'),
    ]
  else if (count < 100)
    return [
      require('../../assets/mapMarkers/cluster10plusday.png'),
      require('../../assets/mapMarkers/cluster10plusnight.png'),
    ]
  else if (count < 500)
    return [
      require('../../assets/mapMarkers/cluster100plusday.png'),
      require('../../assets/mapMarkers/cluster100plusnight.png'),
    ]
  else if (count < 999)
    return [
      require('../../assets/mapMarkers/cluster500plusday.png'),
      require('../../assets/mapMarkers/cluster500plusnight.png'),
    ]
  else
    return [
      require('../../assets/mapMarkers/cluster999day.png'),
      require('../../assets/mapMarkers/cluster999night.png'),
    ]
}

export const getMarkerName = (year: number, direction: Direction | undefined) => {
  if (direction == 'aero' || '' || undefined) {
    if (year <= 1840) return ['dotpin1840day', 'dotpin1840night']
    else if (year <= 1850) return ['dotpin1850day', 'dotpin1850night']
    else if (year <= 1860) return ['dotpin1860day', 'dotpin1860night']
    else if (year <= 1870) return ['dotpin1870day', 'dotpin1870night']
    else if (year <= 1880) return ['dotpin1880day', 'dotpin1880night']
    else if (year <= 1890) return ['dotpin1890day', 'dotpin1890night']
    else if (year <= 1895) return ['dotpin1895day', 'dotpin1895night']
    else if (year <= 1900) return ['dotpin1900day', 'dotpin1900night']
    else if (year <= 1905) return ['dotpin1905day', 'dotpin1905night']
    else if (year <= 1915) return ['dotpin1915day', 'dotpin1915night']
    else if (year <= 1920) return ['dotpin1920day', 'dotpin1920night']
    else if (year <= 1930) return ['dotpin1930day', 'dotpin1930night']
    else if (year <= 1940) return ['dotpin1940day', 'dotpin1940night']
    else if (year <= 1950) return ['dotpin1950day', 'dotpin1950night']
    else if (year <= 1955) return ['dotpin1955day', 'dotpin1955night']
    else if (year <= 1960) return ['dotpin1960day', 'dotpin1960night']
    else if (year <= 1965) return ['dotpin1965day', 'dotpin1965night']
    else if (year <= 1970) return ['dotpin1970day', 'dotpin1970night']
    else if (year <= 1975) return ['dotpin1975day', 'dotpin1975night']
    else if (year <= 1980) return ['dotpin1980day', 'dotpin1980night']
    else if (year <= 1990) return ['dotpin1990day', 'dotpin1990night']
    else return ['dotpin2000day', 'dotpin2000night']
  } else {
    if (year <= 1840) return ['arrowpin1840day', 'arrowpin1840night']
    else if (year <= 1850) return ['arrowpin1850day', 'arrowpin1850night']
    else if (year <= 1860) return ['arrowpin1860day', 'arrowpin1860night']
    else if (year <= 1870) return ['arrowpin1870day', 'arrowpin1870night']
    else if (year <= 1880) return ['arrowpin1880day', 'arrowpin1880night']
    else if (year <= 1890) return ['arrowpin1890day', 'arrowpin1890night']
    else if (year <= 1895) return ['arrowpin1895day', 'arrowpin1895night']
    else if (year <= 1900) return ['arrowpin1900day', 'arrowpin1900night']
    else if (year <= 1905) return ['arrowpin1905day', 'arrowpin1905night']
    else if (year <= 1915) return ['arrowpin1915day', 'arrowpin1915night']
    else if (year <= 1920) return ['arrowpin1920day', 'arrowpin1920night']
    else if (year <= 1930) return ['arrowpin1930day', 'arrowpin1930night']
    else if (year <= 1940) return ['arrowpin1940day', 'arrowpin1940night']
    else if (year <= 1950) return ['arrowpin1950day', 'arrowpin1950night']
    else if (year <= 1955) return ['arrowpin1955day', 'arrowpin1955night']
    else if (year <= 1960) return ['arrowpin1960day', 'arrowpin1960night']
    else if (year <= 1965) return ['arrowpin1965day', 'arrowpin1965night']
    else if (year <= 1970) return ['arrowpin1970day', 'arrowpin1970night']
    else if (year <= 1975) return ['arrowpin1975day', 'arrowpin1975night']
    else if (year <= 1980) return ['arrowpin1980day', 'arrowpin1980night']
    else if (year <= 1990) return ['arrowpin1990day', 'arrowpin1990night']
    else return ['arrowpin2000day', 'arrowpin2000night']
  }
}

export const getMarkerClusterName = (count: number) => {
  if (count === 2) return ['cluster2day', 'cluster2night']
  else if (count < 10) return ['cluster2plusday', 'cluster2plusnight']
  else if (count < 100) return ['cluster10plusday', 'cluster10plusnight']
  else if (count < 500) return ['cluster100plusday', 'cluster100plusnight']
  else if (count < 999) return ['cluster500plusday', 'cluster500plusnight']
  else return ['cluster999day', 'cluster999night']
}
