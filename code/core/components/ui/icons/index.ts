import createIconSet from '@expo/vector-icons/createIconSet'
import materialGlyphs from '../../../../assets/icons/MaterialIcons.glyphmap.json'
import fontAwesomeGlyphs from '../../../../assets/icons/FontAwesome5.glyphmap.json'
import featherGlyphs from '../../../../assets/icons/Feather.glyphmap.json'

/**
 * Icon sets backed by trimmed fonts.
 *
 * `@expo/vector-icons` ships each font whole: 600 KB for the twenty glyphs the app draws. The
 * fonts under `assets/icons` hold only those glyphs and are produced by
 * `scripts/subset-icon-fonts.py` from `assets/icons/glyphs.json`. The glyph maps come from the
 * same script, so an icon name that is not in the manifest fails to type-check instead of
 * rendering as an empty box. Licences of the source fonts: `assets/icons/LICENSES.md`.
 */
export const MaterialIcons = createIconSet(
  materialGlyphs,
  'PastVuMaterialIcons',
  require('../../../../assets/icons/MaterialIcons.ttf'),
)

export const FontAwesome5 = createIconSet(
  fontAwesomeGlyphs,
  'PastVuFontAwesome5Solid',
  require('../../../../assets/icons/FontAwesome5.ttf'),
)

export const Feather = createIconSet(
  featherGlyphs,
  'PastVuFeather',
  require('../../../../assets/icons/Feather.ttf'),
)
