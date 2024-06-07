import { makeAutoObservable } from 'mobx'
import { MMKVStorage } from '../storage/Storage'
import { DefaultTheme } from 'styled-components'
import { DarkTheme, LightTheme } from '../components/theme/Theme'

const ThemeConstant: { [key: string]: DefaultTheme } = {
  Светлая: LightTheme,
  Тёмная: DarkTheme,
}

class ThemeStore {
  themeSettingsTitle = MMKVStorage.get('theme') ?? 'Системная'
  themeSettings = ThemeConstant[this.themeSettingsTitle] ?? LightTheme
  constructor() {
    makeAutoObservable(this)
  }

  changeSettingsThemeTitle = (value: string) => {
    this.themeSettingsTitle = value
    value !== 'Системная' && (this.themeSettings = ThemeConstant[value])
    MMKVStorage.set('theme', value)
  }

  changeSettingsTheme = (value: DefaultTheme) => {
    this.themeSettings = value
  }
}

export default new ThemeStore()
