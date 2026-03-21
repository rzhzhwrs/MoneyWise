module.exports = function (api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache(() => process.env.NODE_ENV);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      'nativewind/babel',
      // Reanimated plugin requires react-native-worklets which is unavailable in Jest
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
