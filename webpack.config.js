const path = require('path');

module.exports = [
    {
        entry: './src/script.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        devServer: {
            host: "0.0.0.0",
            disableHostCheck: true
        }
    },
    {
        entry: './test/main.test.js',
        output: {
            path: path.resolve(__dirname, 'test'),
            filename: 'bundle-test.js'
        },
        devServer: {
            host: "0.0.0.0",
            disableHostCheck: true
        }
    }
];
