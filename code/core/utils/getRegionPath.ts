export const getRegionPath = (regionIds: number[], regionsMap: Map<number, any>): string => {
  const names = regionIds
    .map(id => {
      const region = regionsMap.get(id)
      return region?.title_local || region?.title_en
    })
    .filter(Boolean)
  return names.join(', ')
}
