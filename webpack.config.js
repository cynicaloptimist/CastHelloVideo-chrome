var path = require('path');

module.exports = {
    entry: './client/index.ts',
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    }
}