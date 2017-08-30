const path = require('path');

const explicitlyResolvedIncorrectPath = path.resolve(__dirname, 'node_modules/seek-style-guide');
const resolvedPath = require.resolve('seek-style-guide');

module.exports = resolvedPath.indexOf(explicitlyResolvedIncorrectPath) > -1;
