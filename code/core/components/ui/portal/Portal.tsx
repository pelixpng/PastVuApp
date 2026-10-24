import {
	createContext,
	FC,
	Fragment,
	ReactNode,
	useContext,
	useEffect,
	useId,
	useMemo,
	useState
} from 'react'
import { StyleSheet, View } from 'react-native'

type PortalActions = {
	mount: (host: string, key: string, node: ReactNode) => void
	unmount: (host: string, key: string) => void
}

/** Host name → portal key → what that portal draws, in the order the portals appeared. */
type PortalEntries = Record<string, Record<string, ReactNode>>

const DEFAULT_HOST = 'default'

// Two contexts: a portal's new content re-renders the host alone, not the other portals and not
// the tree under the provider.
const ActionsContext = createContext<PortalActions | null>(null)
const EntriesContext = createContext<PortalEntries>({})

/**
 * Lets a screen draw over views that are not its own, e.g. the map's nearby-photos sheet over the
 * tab bar, which the tab navigator draws above every tab screen. A Portal renders nothing where it
 * stands; its children show in the PortalHost of the same name, with the host's context (theme,
 * safe area), and keep following the screen's state through their props and MobX.
 */
export const PortalProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [entries, setEntries] = useState<PortalEntries>({})
	const actions = useMemo<PortalActions>(
		() => ({
			mount: (host, key, node) =>
				setEntries(current => ({
					...current,
					[host]: { ...current[host], [key]: node }
				})),
			unmount: (host, key) =>
				setEntries(current => {
					if (!current[host] || !(key in current[host])) return current
					const rest = { ...current[host] }
					delete rest[key]
					return { ...current, [host]: rest }
				})
		}),
		[]
	)
	return (
		<ActionsContext.Provider value={actions}>
			<EntriesContext.Provider value={entries}>
				{children}
			</EntriesContext.Provider>
		</ActionsContext.Provider>
	)
}

/**
 * Where the portals named `name` draw: a layer over the host's parent that passes every touch
 * outside the portals' own views on to what is underneath.
 */
export const PortalHost: FC<{ name?: string }> = ({ name = DEFAULT_HOST }) => {
	const entries = useContext(EntriesContext)[name]
	const keys = entries ? Object.keys(entries) : []
	if (!keys.length) return null
	return (
		<View style={s.layer} pointerEvents="box-none">
			{keys.map(key => (
				<Fragment key={key}>{entries[key]}</Fragment>
			))}
		</View>
	)
}

const usePortalActions = () => {
	const actions = useContext(ActionsContext)
	if (!actions) throw new Error('Portal is outside a PortalProvider')
	return actions
}

/** Draws its children in the PortalHost named `host` instead of here. */
export const Portal: FC<{ host?: string; children: ReactNode }> = ({
	host = DEFAULT_HOST,
	children
}) => {
	const actions = usePortalActions()
	const key = useId()
	useEffect(() => {
		actions.mount(host, key, children)
	}, [actions, host, key, children])
	useEffect(() => () => actions.unmount(host, key), [actions, host, key])
	return null
}

const s = StyleSheet.create({
	// Android draws siblings by elevation before tree order, and the tab bar has 8: the layer needs
	// more to stay above it, with everything it holds.
	layer: { ...StyleSheet.absoluteFill, elevation: 16 }
})
