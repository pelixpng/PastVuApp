import ApiService from '../api/apiService'

let regions: Promise<Map<number, any>> | null = null

/**
 * The public region list, fetched once per launch and shared: every profile describes its photos
 * with it, and the list does not change while the app runs. A failed request is not cached.
 */
export const loadRegions = (): Promise<Map<number, any>> => {
  if (!regions) {
    regions = ApiService.getRegions().catch(error => {
      regions = null
      throw error
    })
  }
  return regions
}
