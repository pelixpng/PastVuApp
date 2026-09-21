import { useLocalObservable } from 'mobx-react-lite'

interface IViewModel<T> {
  new (): T
}

export const useVM = <ViewModel extends Record<string, any>>(
  viewModel: IViewModel<ViewModel>,
): ViewModel => useLocalObservable(() => new viewModel())
