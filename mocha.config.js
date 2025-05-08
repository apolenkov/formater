export default {
  'extension': ['mjs'],
  'node': true,
  'package': './package.json',
  'recursive': true,
  'node-option': [
    'experimental-specifier-resolution=node',
    'loader=@babel/register',
  ],
};
