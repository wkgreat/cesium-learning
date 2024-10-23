const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');

module.exports = [{
    mode: 'development',
    context: __dirname,
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'eval',
    resolve: {
        mainFields: ['module', 'main'],
        fallback: {
            fs: false,
            path: false,
            Buffer: false,
            http: false,
            https: false,
            zlib: false
        }
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: ['url-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'Workers' },
                { from: 'node_modules/cesium/Build/Cesium/ThirdParty', to: 'ThirdParty' },
                { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'Assets' },
                { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'Widgets' },
                { from: 'src/s3m/S3M_module/S3MParser/draco_decoder_new.wasm', to: 'S3M_module/S3MParser/draco_decoder_new.wasm' },
                { from: 'src/s3m/S3M_module/S3MTiles/ThirdParty/crunch.wasm', to: 'S3M_module/S3MTiles/ThirdParty/crunch.wasm' }
            ],
        }),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        }),
        AutoImport({
            include: [/\.[tj]sx?$/],
            imports: [
                {
                    'cesium': [['*', 'Cesium']]
                }
            ]
        })
    ],

    // development server options
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000
    }
}];
