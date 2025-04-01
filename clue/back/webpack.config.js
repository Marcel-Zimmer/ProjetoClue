const { watch } = require('fs');
const path = require('path');

module.exports = {
    target: 'web',
    watch: true,
    mode: 'development',
    entry: {
        'index': './src/index.js',
        'game': './src/game.js',
        // 'requests': './src/requests.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
};