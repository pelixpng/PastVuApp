import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { BaseViewModelProvider } from '../../../store/vm.provider'
import { SCREENS } from '../../../navigation/navigation.types'
import { IComment, Users } from '../../../types/apiPhotoComment'
import ApiService from '../../../api/apiService'
import { HistoryItem } from '../photoHistory/PhotoHistory.screen'
import { MMKVStorage } from '../../../storage/storage'
import { Alert, Platform } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import ApiStore from '../../../store/global/Api.store'

class PhotoDetailVM extends BaseViewModelProvider<SCREENS.PHOTO_DETAIL> {
  @observable comments: IComment[] = []
  @observable users: Users | null = null
  @observable postInfo: Photo | null = null

  constructor() {
    super()
    makeObservable(this)
    autorun(() => {
      this.screenParams?.cid && this.getPhotoInfo()
    })
  }

  // ------------------------------------------ Computed ------------------------------------------

  @computed
  get photoQuality() {
    return ApiStore.photoQualitySettings
  }

  // ------------------------------------------ Actions ------------------------------------------

  @action.bound
  async getPhotoInfo() {
    await ApiService.getPhotoInfo(this.screenParams.cid)
      .then(async ({ result }) => {
        this.postInfo = result.photo
        const cid = this.screenParams.cid
        const history: HistoryItem[] = MMKVStorage.get('History') ?? []
        const title = result.photo.title
        const description = `${result.photo.y} ${result.photo.regions
          .map(region => region.title_local)
          .join(', ')}`
        const file = result.photo.file
        if (!history.some(item => item.cid === cid)) {
          MMKVStorage.set('History', [{ title, description, cid, file }, ...history])
        }
        if (result.photo?.ccount) {
          this.getComments()
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить информацию о фото'))
  }

  @action.bound
  async getComments() {
    await ApiService.getComments(this.screenParams.cid).then(({ users, comments }) => {
      this.users = users
      this.comments = comments
    })
  }

  @action.bound
  async saveImage() {
    if (this.postInfo) {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync(true)
        if (status !== 'granted') {
          Alert.alert('Ошибка', 'Нет разрешения на сохранение изображений')
          return
        }
        const fileUri = `https://pastvu.com/_p/a/${this.postInfo.file}`
        let localUri = fileUri
        if (Platform.OS === 'android') {
          const fileExtension = this.postInfo.file?.substring(this.postInfo.file.indexOf('.')) || ''
          const fileName = `${this.postInfo.title?.substring(0, 15) || 'image'}${fileExtension}`
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
  }
}

export default PhotoDetailVM
