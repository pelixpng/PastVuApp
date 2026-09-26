#!/usr/bin/env python3
"""Trims the icon fonts from @expo/vector-icons down to the glyphs the app uses.

Reads assets/icons/glyphs.json, writes assets/icons/<Set>.ttf and assets/icons/<Set>.glyphmap.json.
The full fonts weigh 600 KB and ship in every install for ~20 glyphs; the trimmed ones are a few
kilobytes. Needs fonttools:  python3 -m pip install fonttools

Font Awesome Free is licensed under the SIL OFL, which reserves the name "Font Awesome" for the
unmodified font, so every trimmed font gets a PastVu-prefixed family name. See assets/icons/LICENSES.md.
"""
import json
import os
import sys

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit('fonttools is missing: python3 -m pip install fonttools')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENDOR = os.path.join(ROOT, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons')
OUT = os.path.join(ROOT, 'assets', 'icons')

# set name -> (font file, glyph map, family name of the trimmed font)
SETS = {
    'MaterialIcons': ('MaterialIcons.ttf', 'MaterialIcons.json', 'PastVuMaterialIcons'),
    'FontAwesome5': ('FontAwesome5_Solid.ttf', 'FontAwesome5Free.json', 'PastVuFontAwesome5Solid'),
    'Feather': ('Feather.ttf', 'Feather.json', 'PastVuFeather'),
}


def rename(font, family):
    for record in font['name'].names:
        if record.nameID in (1, 3, 4, 6, 16):
            record.string = family


def main():
    wanted = json.load(open(os.path.join(OUT, 'glyphs.json'), encoding='utf-8'))
    for set_name, (font_file, map_file, family) in SETS.items():
        names = wanted.get(set_name, [])
        full_map = json.load(open(os.path.join(VENDOR, 'glyphmaps', map_file), encoding='utf-8'))
        missing = [n for n in names if n not in full_map]
        if missing:
            sys.exit(f'{set_name}: unknown glyphs {missing}')
        codepoints = {n: full_map[n] for n in names}

        font = TTFont(os.path.join(VENDOR, 'fonts', font_file))
        options = subset.Options(hinting=False, desubroutinize=True, notdef_outline=True)
        options.drop_tables += ['FFTM']
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=list(codepoints.values()))
        subsetter.subset(font)
        rename(font, family)
        out_font = os.path.join(OUT, f'{set_name}.ttf')
        font.save(out_font)

        with open(os.path.join(OUT, f'{set_name}.glyphmap.json'), 'w', encoding='utf-8') as fh:
            json.dump(codepoints, fh, indent=2, ensure_ascii=False)
            fh.write('\n')
        print(f'{set_name:14} {len(names):3} glyphs -> {os.path.getsize(out_font) / 1024:5.1f} KB  ({family})')


if __name__ == '__main__':
    main()
