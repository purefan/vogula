const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin')

module.exports = {
    entry: [ 'babel-polyfill', './src/index.js' ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new webpack.DefinePlugin({ CONFIG: JSON.stringify(require('config')) })
        , new HtmlWebpackPlugin({
            title: 'Vogula Chess',
            meta: {
                viewport: 'width=device-width, initial-scale=1'
            }
        })
        , new CspHtmlWebpackPlugin()
    ],
    module: {
        rules: [
            /*** Translations ***/
            {
                test: /i18n\.json/,
                type: 'javascript/auto',
                loader: require.resolve('messageformat-loader'),
                include: path.resolve(__dirname, 'src'),
                options: {
                    biDiSupport: false,
                    convert: false,
                    customFormatters: null,
                    locale: [ 'en', 'sv' ],
                    strictNumberSign: false
                }
            },
            /*** JS ****/
            {
                test: /\.js$/,
                include: [ path.resolve(__dirname, 'src'), path.resolve(__dirname, 'lib') ],
                loader: 'babel-loader',
                query: {
                    presets: [ '@babel/preset-env' ]
                }
            },
            /*** CSS ***/
            {
                test: /\.css$/,
                include: [ path.resolve(__dirname, 'src') ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: true
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            /*** SCSS ***/
            {
                test: /\.scss$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            /*** Images ***/
            {
                test: /\.(png|jpg|gif|svg)$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'img'
                        }
                    }
                ]
            }
        ]
    },
    stats: {
        colors: true
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    devtool: 'source-map',
    mode: 'development'
}