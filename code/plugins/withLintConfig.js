const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Turns off lint's `ExtraTranslation` check for the app module.
 *
 * `expo.locales` exists to localize the iOS permission dialogs, but Expo mirrors that same JSON
 * into Android string resources (`values-b+ru/strings.xml` and friends) with no way to scope it to
 * one platform. The keys are iOS ones — `NSLocationWhenInUseUsageDescription` and the like — so
 * they have no counterpart in the default locale, and lint fails the release build over it.
 *
 * The rule guards against strings that are looked up on a locale that lacks them; nothing on
 * Android ever looks these up, so the risk it describes cannot happen here. Adding the keys to the
 * default locale would silence it too, at the cost of shipping strings that mean nothing.
 */
const withLintConfig = config =>
  withAppBuildGradle(config, config => {
    const contents = config.modResults.contents
    if (contents.includes("disable 'ExtraTranslation'")) {
      return config
    }
    config.modResults.contents = contents.replace(
      /(\n\s*buildTypes \{)/,
      `
    lint {
        disable 'ExtraTranslation'
    }
$1`,
    )
    return config
  })

module.exports = withLintConfig
