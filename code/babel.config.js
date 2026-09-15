module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
      'react-native-worklets/plugin',
    ],
    // MobX legacy-декораторы требуют set-семантики полей класса. С Hermes/Metro
    // babel-preset-expo этого не делает, поэтому форсируем class-properties в loose
    // только для нашего кода (в node_modules это ломало бы TS `declare`-поля).
    overrides: [
      {
        // Функция, а не RegExp: Metro вычисляет cache-key без filename, и
        // строковый/RegExp-паттерн там кидает ошибку. Функция получает undefined
        // и безопасно возвращает false.
        exclude: filename => !!filename && filename.includes('node_modules'),
        plugins: [
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ],
      },
    ],
  }
}
