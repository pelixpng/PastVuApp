Pod::Spec.new do |s|
  s.name           = 'CameraLenses'
  s.version        = '1.0.0'
  s.summary        = 'Lists the back camera lenses with their zoom factors.'
  s.description    = 'Local Expo module that reads lens switch-over factors from AVFoundation.'
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
