import { observable, runInAction } from 'mobx'
import { NavigationContainerRef, ParamListBase, StackActions } from '@react-navigation/native'
import { SCREENS } from '../navigation/navigation.types'
import { StackParamList } from '../navigation/stackParams.types'
import { NavigationRef } from '../AppMobile'

export class BaseViewModelProvider<SCREEN extends SCREENS> {
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

  /**
   * Goes back to the screen, with the new params, when one with the same name is already in the
   * stack, instead of opening a second copy on top.
   */
  navigateTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.navigate(screen as string, params, { pop: true })
  }

  /**
   * Opens the screen on top even when one with the same name is already in the stack: `navigateTo`
   * would jump back to it instead (profile, then a photo, then another profile).
   */
  pushTo<C extends SCREENS>(screen: C, params?: StackParamList[C]) {
    this.navigator?.dispatch(StackActions.push(screen as string, params))
  }
}
