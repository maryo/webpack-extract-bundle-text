# Extract Bundle Text Plugin

`npm install --save-dev webpack-extract-bundle-text`

Extracts text from webpack bundle into an additional asset.

```js
const ExtractBundleTextPlugin = require('webpack-extract-bundle-text');

module.exports = {
    entry: {
        'index.html': path.resolve(__dirname, 'src/index.html'),
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader?interpolate',
            },
        ]
    },
    plugins: [new ExtractBundleTextPlugin('index.html')]
}
```

## Options
By chunk name (the generated output file will equal the chunk name)
```js
new ExtractTextPlugin('index.html')
```

Or by file names

```js
new ExtractTextPlugin({
    inputFile: 'index.html.js',
    outputFile: 'index.html',
})
```
