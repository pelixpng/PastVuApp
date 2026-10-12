import { useCallback, useRef, useState } from 'react'
import type {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'

/** Room left above the tabs when the list is brought back to them. */
const TABS_GAP = 8

/**
 * Keeps a list's tabs where they are when another tab is picked.
 *
 * Picking a tab swaps the rows under a header the page may have scrolled past. The new rows start
 * out empty while their first page loads, or are simply fewer, so the content shrinks under the
 * scroll position and the page jumps back up to the header. Instead, a page scrolled past the tabs
 * is brought to them before the switch, and the content stays tall enough to hold that position
 * whatever the list has in it.
 *
 * `headerTop` is where the list header starts in the content: the content's top padding.
 */
export const useTabsAnchor = <T>(headerTop: number) => {
  const listRef = useRef<FlatList<T>>(null)
  const scrollY = useRef(0)
  const [tabsY, setTabsY] = useState(0)
  const [listHeight, setListHeight] = useState(0)
  const anchor = Math.max(0, headerTop + tabsY - TABS_GAP)

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y
  }, [])

  const onListLayout = useCallback((e: LayoutChangeEvent) => {
    setListHeight(e.nativeEvent.layout.height)
  }, [])

  /** For the view wrapping the tabs, placed directly in the list header. */
  const onTabsLayout = useCallback((e: LayoutChangeEvent) => {
    setTabsY(e.nativeEvent.layout.y)
  }, [])

  /** Call before switching the rows. A page still showing the header is left where it is. */
  const keepTabsInPlace = useCallback(() => {
    if (scrollY.current > anchor) {
      listRef.current?.scrollToOffset({ offset: anchor, animated: false })
    }
  }, [anchor])

  return {
    listRef,
    onScroll,
    onListLayout,
    onTabsLayout,
    keepTabsInPlace,
    contentMinHeight: anchor + listHeight,
  }
}
