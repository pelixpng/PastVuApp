/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: 'widget',
  images: {
    historySlidePreview: '../../assets/iosWidget/historySlidePreview.jpg',
    historyListPreviewFirst: '../../assets/iosWidget/historyListPreviewFirst.jpg',
    historyListPreviewSecond: '../../assets/iosWidget/historyListPreviewSecond.jpg',
    historyListPreviewThird: '../../assets/iosWidget/historyListPreviewThird.jpg',
    historyListPreviewFourth: '../../assets/iosWidget/historyListPreviewFourth.jpg',
    historyListPreviewFifth: '../../assets/iosWidget/historyListPreviewFifth.jpg',
  },
  deploymentTarget: '17.0',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.pelixpng.PastVuApp'],
  },
})
