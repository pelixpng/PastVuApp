const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const SOURCE = path.resolve(__dirname, '../assets/mapMarkers')

// Group files by base name, collecting scales
// e.g. { dotpin1840day: { '1x': 'dotpin1840day.png', '2x': 'dotpin1840day@2x.png', ... } }
function groupByBaseName(files) {
  const groups = {}
  for (const file of files) {
    if (!file.endsWith('.png')) continue
    const name = file.replace(/\.png$/, '')
    const match = name.match(/^(.+?)(@[234]x)?$/)
    if (!match) continue
    const base = match[1]
    const suffix = match[2] ?? ''
    if (!groups[base]) groups[base] = {}
    const scale = suffix === '' ? '1x' : suffix.slice(1)
    groups[base][scale] = file
  }
  return groups
}

// ─── iOS ───────────────────────────────────────────────────────────────────

const withMapMarkersIos = config =>
  withDangerousMod(config, [
    'ios',
    async config => {
      const xcassetsPath = path.join(
        config.modRequest.platformProjectRoot,
        'PastVu',
        'Images.xcassets',
      )

      const files = fs.readdirSync(SOURCE)
      const groups = groupByBaseName(files)

      for (const [baseName, scales] of Object.entries(groups)) {
        const imagesetDir = path.join(xcassetsPath, `${baseName}.imageset`)
        fs.mkdirSync(imagesetDir, { recursive: true })

        const images = []
        for (const scale of ['1x', '2x', '3x']) {
          const filename = scales[scale]
          if (!filename) continue
          fs.copyFileSync(path.join(SOURCE, filename), path.join(imagesetDir, filename))
          images.push({ idiom: 'universal', filename, scale })
        }

        const contents = { images, info: { version: 1, author: 'expo' } }
        fs.writeFileSync(path.join(imagesetDir, 'Contents.json'), JSON.stringify(contents, null, 2))
      }

      return config
    },
  ])

// ─── Android ───────────────────────────────────────────────────────────────

const DENSITY_MAP = {
  '1x': 'drawable-mdpi',
  '2x': 'drawable-xhdpi',
  '3x': 'drawable-xxhdpi',
  '4x': 'drawable-xxxhdpi',
}

const withMapMarkersAndroid = config =>
  withDangerousMod(config, [
    'android',
    async config => {
      const resPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
      )

      const files = fs.readdirSync(SOURCE)
      const groups = groupByBaseName(files)

      for (const [baseName, scales] of Object.entries(groups)) {
        for (const [scale, filename] of Object.entries(scales)) {
          const folder = DENSITY_MAP[scale] ?? 'drawable'
          const destDir = path.join(resPath, folder)
          fs.mkdirSync(destDir, { recursive: true })
          // filename already lowercase, just strip the @2x/@3x/@4x suffix for Android
          const androidFilename = baseName + '.png'
          fs.copyFileSync(path.join(SOURCE, filename), path.join(destDir, androidFilename))
        }
      }

      return config
    },
  ])

// ─── Export ────────────────────────────────────────────────────────────────

module.exports = config => withMapMarkersAndroid(withMapMarkersIos(config))
