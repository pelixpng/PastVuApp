import { requireNativeModule } from 'expo-modules-core'

export type ApiKeyName = 'PLACE_API_KEY' | 'STREET_VIEW_API_KEY' | 'YANDEX_MAPS_API_KEY'

const native = requireNativeModule<{ get(name: string): string }>('AppKeys')

/**
 * An API key from the native side: the manifest on Android, Info.plist on iOS. Both are filled
 * from `.env` at build time, so nothing is committed and nothing sits in the Expo config asset.
 * Returns an empty string when the key was not provided to the build.
 */
export const getApiKey = (name: ApiKeyName): string => native.get(name) ?? ''
