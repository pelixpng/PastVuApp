import { observable, runInAction } from 'mobx'
import { NavigationContainerRef, ParamListBase, StackActions } from '@react-navigation/native'
import { SCREENS } from '../navigation/navigation.types'
import { StackParamList } from '../navigation/stackParams.types'
import { NavigationRef } from '../AppMobile'

interface IBaseViewModelProvider<T extends SCREENS> {
  screenName?: T
}

export class BaseViewModelProvider<SCREEN extends SCREENS>
  implements IBaseViewModelProvider<SCREEN>
{
  screenName?: SCREEN
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

  /**
   * Opens the screen on top even when one with the same name is already in the stack: `navigate`
   * would jump back to it instead (profile, then a photo, then another profile).
   */
  pushTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.dispatch(StackActions.push(screen as string, params))
  }

  resetNavigateTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.reset({
      index: 0,
      routes: [{ name: screen as string, params }],
    })
  }
}
