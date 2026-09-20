/**
 * Drops the map components the app never renders from the Yandex map library's codegen config.
 *
 * The polygon, polyline and circle views are deleted by `patches/@exterio+react-native-yamap-lite`,
 * but patch-package cannot carry a change to a package's own `package.json`, and leaving them in
 * `codegenConfig` makes the generated component provider point at classes that no longer exist.
 * So this runs right after patch-package, from `postinstall`.
 */
const fs = require('fs')
const path = require('path')

const PKG = path.join(
  __dirname,
  '..',
  'node_modules',
  '@exterio',
  'react-native-yamap-lite',
  'package.json',
)
const UNUSED = ['YamapLiteCircleView', 'YamapLitePolygonView', 'YamapLitePolylineView']

if (!fs.existsSync(PKG)) process.exit(0)

const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'))
const provider = pkg.codegenConfig && pkg.codegenConfig.ios && pkg.codegenConfig.ios.componentProvider
if (!provider) process.exit(0)

const removed = UNUSED.filter(name => name in provider)
if (removed.length === 0) process.exit(0)

for (const name of removed) delete provider[name]
fs.writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n')
console.log('trim-yamap-codegen: убраны ' + removed.join(', '))
