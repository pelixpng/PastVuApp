import { MMKVStorage } from '../../storage/storage'
import { action, makeObservable, observable } from 'mobx'

class ThemeStore {
  @observable selectedTheme = MMKVStorage.get('themeApp') ?? 'system'
  constructor() {
    makeObservable(this)
  }

  @action.bound
  setTheme = (value: string) => {
    this.selectedTheme = value
    MMKVStorage.set('themeApp', value)
  }
}

export default new ThemeStore()
