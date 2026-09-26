const {
  withAndroidManifest,
  withAppBuildGradle,
  withInfoPlist,
  withDangerousMod,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Delivers API keys to the app without putting them in the Expo config.
 *
 * Anything in `extra` ships inside the bundle as the `app.config` asset, where any APK inspector
 * lists it. Instead the keys travel the way the Google Maps key already does:
 *
 * - Android: `defaultConfig` reads `.env` at build time and fills manifest placeholders; the
 *   manifest keeps `<meta-data>` entries with `${NAME}` only.
 * - iOS: Info.plist keeps `$(NAME)` references; the Podfile generates `ios/Keys.xcconfig` from
 *   `.env` and includes it into the app target's Pods xcconfig, so Xcode resolves them at build.
 *
 * `modules/app-keys` reads the values at runtime. Nothing is written to a tracked file.
 */
const KEYS = ['PLACE_API_KEY', 'STREET_VIEW_API_KEY', 'YANDEX_MAPS_API_KEY']

const gradleBlock = `        // PastVu: API keys come from the project's .env at build time and land in the manifest as
        // <meta-data>, read by modules/app-keys. See plugins/withApiKeys.js.
        def pastvuEnv = new Properties()
        def pastvuEnvFile = rootProject.file('../.env')
        if (pastvuEnvFile.exists()) { pastvuEnvFile.withReader('UTF-8') { pastvuEnv.load(it) } }
        def pastvuKey = { String name ->
            (pastvuEnv.getProperty(name) ?: System.getenv(name) ?: '').trim().replaceAll(/^["']|["']$/, '')
        }
        manifestPlaceholders += [
${KEYS.map(k => `            ${k}: pastvuKey('${k}'),`).join('\n')}
        ]
`

const podfilePreInstall = `# PastVu: Info.plist holds $(NAME) references for the API keys; the values come from ../.env
# through this generated, git-ignored xcconfig. See plugins/withApiKeys.js.
pre_install do |installer|
  env_file = File.expand_path('../.env', __dir__)
  values = {}
  if File.exist?(env_file)
    File.foreach(env_file) do |line|
      next unless line =~ /\\A\\s*([A-Z0-9_]+)\\s*=\\s*(.*?)\\s*\\z/
      values[$1] = $2.gsub(/\\A["']|["']\\z/, '')
    end
  end
  keys = %w[${KEYS.join(' ')}]
  File.write(File.join(__dir__, 'Keys.xcconfig'), keys.map { |k| "#{k} = #{values[k] || ''}" }.join("\\n") + "\\n")
end

`

const podfilePostInstall = `    # PastVu: make the app target's xcconfig pull in the generated Keys.xcconfig.
    Dir.glob(File.join(__dir__, 'Pods', 'Target Support Files', 'Pods-PastVu', '*.xcconfig')).each do |xcconfig|
      include_line = '#include? "../../../Keys.xcconfig"'
      content = File.read(xcconfig)
      File.write(xcconfig, content + "\\n" + include_line + "\\n") unless content.include?(include_line)
    end
`

const withAndroid = config => {
  config = withAndroidManifest(config, config => {
    const app = config.modResults.manifest.application[0]
    app['meta-data'] = app['meta-data'] || []
    for (const key of KEYS) {
      if (!app['meta-data'].some(m => m.$['android:name'] === key)) {
        app['meta-data'].push({ $: { 'android:name': key, 'android:value': `\${${key}}` } })
      }
    }
    return config
  })
  return withAppBuildGradle(config, config => {
    const contents = config.modResults.contents
    if (!contents.includes('pastvuKey(')) {
      config.modResults.contents = contents.replace(
        /(\n\s*applicationId ['"][^'"]+['"]\n)/,
        `$1${gradleBlock}`,
      )
    }
    return config
  })
}

const withIos = config => {
  config = withInfoPlist(config, config => {
    for (const key of KEYS) config.modResults[key] = `$(${key})`
    return config
  })
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfile = path.join(config.modRequest.platformProjectRoot, 'Podfile')
      let contents = fs.readFileSync(podfile, 'utf8')
      if (!contents.includes('Keys.xcconfig')) {
        contents = contents.replace(/(\ntarget 'PastVu' do\n)/, `\n${podfilePreInstall}$1`)
        contents = contents.replace(
          /(react_native_post_install\([\s\S]*?\n    \)\n)/,
          `$1${podfilePostInstall}`,
        )
        fs.writeFileSync(podfile, contents)
      }
      return config
    },
  ])
}

module.exports = config => withIos(withAndroid(config))
