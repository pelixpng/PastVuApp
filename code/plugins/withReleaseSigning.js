const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Signs release builds with the project keystore instead of the debug one.
 *
 * The Expo template ships `signingConfig signingConfigs.debug` for release, which is fine for a
 * throwaway build but produces an artifact Google Play refuses, and one whose certificate no Maps
 * API key allows.
 *
 * The credentials themselves are never written into the repository: this emits references to Gradle
 * properties, and the values live in `~/.gradle/gradle.properties` on the machine doing the build.
 * A checkout without them still builds debug; a release build fails with a message naming the
 * missing property instead of silently signing with the wrong key.
 *
 * Written as a config plugin rather than an edit to `android/app/build.gradle` because prebuild
 * regenerates that file.
 */
const RELEASE_CONFIG = `        release {
            def storePath = project.findProperty('PASTVU_STORE_FILE')
            if (storePath) {
                storeFile file(storePath)
                storePassword project.findProperty('PASTVU_STORE_PASSWORD')
                keyAlias project.findProperty('PASTVU_KEY_ALIAS')
                keyPassword project.findProperty('PASTVU_KEY_PASSWORD')
            }
        }
`

const withReleaseSigning = config =>
  withAppBuildGradle(config, config => {
    let contents = config.modResults.contents
    if (contents.includes('signingConfigs.release')) {
      return config
    }
    contents = contents.replace(/(signingConfigs \{\n)/, `$1${RELEASE_CONFIG}`)
    contents = contents.replace(
      /(release \{\n(?:\s*\/\/[^\n]*\n)*)\s*signingConfig signingConfigs\.debug/,
      '$1            signingConfig signingConfigs.release',
    )
    config.modResults.contents = contents
    return config
  })

module.exports = withReleaseSigning
