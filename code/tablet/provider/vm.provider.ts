import { observable, runInAction } from 'mobx'
import { NavigationContainerRef, ParamListBase } from '@react-navigation/native'
import { SCREENS } from '../navigation/navigation.types'
import { StackParamList } from '../navigation/stackParams.types'
import { NavigationRef } from '../AppTablet'

interface IBaseViewModelProvider<T extends SCREENS> {
  screenName?: T
}

export class BaseViewModelProvider<SCREEN extends SCREENS>
  implements IBaseViewModelProvider<SCREEN>
{
  @observable.ref navigator: NavigationContainerRef<ParamListBase> | null = null

  constructor() {
    setTimeout(
      () =>
        runInAction(() => {
          this.navigator = NavigationRef.current
        }),
      0,
    )
  }

  get screenParams() {
    return this.navigator?.getCurrentRoute()?.params as StackParamList[SCREEN]
  }

  goBack() {
    this.navigator?.goBack()
  }

  navigateTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.navigate(screen as string, params)
  }

  resetNavigateTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.reset({
      index: 0,
      routes: [{ name: screen as string, params }],
    })
  }
}
