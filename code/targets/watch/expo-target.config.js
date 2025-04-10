/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  name: 'PastVu',
  type: 'watch',
  icon: '../../assets/icon.png',
  deploymentTarget: '9.4',
  entitlements: { 'com.apple.security.application-groups': ['group.com.pelixpng.PastVuApp'] },
})
