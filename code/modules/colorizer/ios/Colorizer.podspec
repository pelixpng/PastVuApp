Pod::Spec.new do |s|
  s.name           = 'Colorizer'
  s.version        = '1.0.0'
  s.summary        = 'Colorizes black-and-white photos on device with Core ML.'
  s.description    = 'Local Expo module running DDColor-L (Apache-2.0) with Core ML, and telling black-and-white photos from colour ones.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  # The model itself is not part of the app: it is downloaded on first use (ModelStore.swift).
end
