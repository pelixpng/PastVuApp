Pod::Spec.new do |s|
  s.name           = 'WindowRegion'
  s.version        = '1.0.0'
  s.summary        = 'Measures the window controls iPadOS draws over a window.'
  s.description    = 'Local Expo module that reports how far the window controls reach below the safe area.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
