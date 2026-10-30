import { requireNativeModule } from 'expo-modules-core'

export type ApiKeyName =
  | 'PLACE_API_KEY'
  | 'STREET_VIEW_API_KEY'
  | 'YANDEX_MAPS_API_KEY'
  | 'TRANSLATE_API_KEY'

/** Who the app is, for a Google key restricted to it: the bundle id on iOS, the package and the
 * signing certificate's SHA-1 (uppercase hex) on Android. */
export type AppIdentity = { bundleId?: string; packageName?: string; certSha1?: string }

const native = requireNativeModule<{
  get(name: string): string
  /** Optional: a build from before it existed lacks it. */
  identity?(): AppIdentity
}>('AppKeys')

/**
 * An API key from the native side: the manifest on Android, Info.plist on iOS. Both are filled
 * from `.env` at build time, so nothing is committed and nothing sits in the Expo config asset.
 * Returns an empty string when the key was not provided to the build.
 */
export const getApiKey = (name: ApiKeyName): string => native.get(name) ?? ''

/** The app's identity as Google checks it for keys restricted to this app; empty when unknown. */
export const getAppIdentity = (): AppIdentity => native.identity?.() ?? {}
