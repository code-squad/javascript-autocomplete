const path = require('path');

module.exports = {
  entry: {
	  app: './test/main.test.js'
  },
  output: {
    filename: 'bundle.test.js',
    path: path.resolve(__dirname, '.')
  }
};
