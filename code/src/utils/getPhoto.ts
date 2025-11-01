import { Alert, Platform, Share } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'

export const sharePhoto = (title: string, cid: string) => {
  Share.share({
    message: `${title}: https://pastvu.com/p/${cid}`,
  })
}

export const savePhoto = async (title: string, file: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync(true)
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нет разрешения на сохранение изображений')
      return
    }
    const fileUri = `https://img.pastvu.com/a/${file}`
    let localUri = fileUri
    if (Platform.OS === 'android') {
      const fileExtension = file.substring(file.indexOf('.')) || ''
      const fileName = `${title?.substring(0, 15) || 'image'}${fileExtension}`
      const downloadResult = await FileSystem.downloadAsync(
        fileUri,
        `${FileSystem.documentDirectory}${fileName}`,
      )
      localUri = downloadResult.uri
    }
    await MediaLibrary.saveToLibraryAsync(localUri)
    Alert.alert('Готово', 'Фотография успешно сохранена в галерею')
  } catch (error) {
    Alert.alert('Ошибка', 'Не удалось сохранить изображение')
  }
}
