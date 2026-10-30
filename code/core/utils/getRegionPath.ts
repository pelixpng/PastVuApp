/**
 * Names of the regions in a photo list's `rs`, by cid, as `photo.givePublicIndex` and
 * `photo.giveUserGallery` bring them next to the photos: the server builds both from the same
 * photos, so every cid of the page is there. A region deleted on the server comes as `{}`.
 */
export type RegionHash = Record<string, { title_local?: string; title_en?: string } | undefined>

/** The server's "Где это?", put first in `rs` of a photo without coordinates: not a region. */
const NOWHERE = 0

/** "Region, region" for a photo's `rs`, deepest first; regions without a name are left out. */
export const getRegionPath = (regionIds: number[] = [], regions: RegionHash = {}): string =>
  regionIds
    .filter(id => id !== NOWHERE)
    .map(id => regions[id]?.title_local || regions[id]?.title_en)
    .filter(Boolean)
    .join(', ')
