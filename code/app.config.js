/**
 * Injects secrets into the static config from the environment, so no key is ever committed.
 *
 * Expo reads `app.json` first and hands it here as `config`. Values live in `.env`, which is
 * gitignored; `app.json` keeps empty placeholders so the shape of the config stays visible.
 */
const requireKey = (name, { optional = false } = {}) => {
  const value = process.env[name]
  if (!value && !optional) {
    // A missing key is not fatal -- a debug build without maps still runs -- but it should be
    // obvious in the build output rather than showing up later as a blank map.
    console.warn(`[app.config] ${name} is not set; the feature that uses it will not work.`)
  }
  return value ?? ''
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    placeApiKey: requireKey('PLACE_API_KEY'),
  },
})
