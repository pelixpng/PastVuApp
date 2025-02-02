import { ExtensionStorage } from '@bacons/apple-targets'

// Create a storage object with the App Group.
export const IosTargetStorage = new ExtensionStorage(
  // Your app group identifier. Should match the values in the app.json and expo-target.config.json.
  'group.com.pelixpng.PastVuApp',
)
