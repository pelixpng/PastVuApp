import { Alert, Share } from 'react-native'
import { Asset, requestPermissionsAsync } from 'expo-media-library'
import * as FileSystem from 'expo-file-system/legacy'
import { t } from '../i18n'

export const sharePhoto = (title: string, cid: string) => {
  Share.share({
    message: `${title}: https://pastvu.com/p/${cid}`,
  })
}

/**
 * Imports a file that already sits on disk into the gallery and tells the user how it went.
 *
 * Write-only, and no granular read permissions: on Android 10+ writing into the shared gallery
 * through MediaStore needs no permission, and asking for READ_MEDIA_IMAGES would request read
 * access to the user's whole library that this app never uses.
 */
export const saveLocalImage = async (localUri: string): Promise<boolean> => {
  const { status } = await requestPermissionsAsync(true)
  if (status !== 'granted') {
    Alert.alert(t('common.error'), t('photo.noPermission'))
    return false
  }
  await Asset.create(localUri)
  Alert.alert(t('common.done'), t('photo.saved'))
  return true
}

export const savePhoto = async (title: string, file: string) => {
  let localUri: string | undefined
  try {
    // `file` arrives as `a/b/c/name.jpg?s=<signature>` from the photo endpoint. Taking everything
    // after the first dot kept the query in the extension, and the media store rejects a file it
    // cannot type. Drop the query, take the last dot, and keep the name free of path characters.
    const path = file.split('?')[0]
    const dot = path.lastIndexOf('.')
    const fileExtension = dot > 0 ? path.slice(dot) : '.jpg'
    const safeTitle = (title || 'image').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 15)
    const fileName = `${safeTitle || 'image'}${fileExtension}`

    // `Asset.create` imports from the local filesystem, so the download now runs on both platforms.
    // The retired `saveToLibraryAsync` accepted a remote URL on iOS, which is why only Android
    // downloaded here before.
    const download = await FileSystem.downloadAsync(
      `https://img.pastvu.com/a/${file}`,
      `${FileSystem.documentDirectory}${fileName}`,
    )
    localUri = download.uri
    await saveLocalImage(localUri)
  } catch (error) {
    // Surfaced in the log: the alert alone gives no clue why a save failed.
    console.error('savePhoto failed', error)
    Alert.alert(t('common.error'), t('photo.saveError'))
  } finally {
    // The copy has been imported into the gallery, so drop it: otherwise every save leaves a
    // full-size photo behind in the app's own storage.
    if (localUri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => undefined)
    }
  }
}
