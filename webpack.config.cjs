const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devtool: 'cheap-source-map',
    watch: true,
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        })
        , new webpack.ProvidePlugin({ m: "mithril" })
        , new HtmlWebpackPlugin({
            title: 'Vogula Chess',
            meta: {
                viewport: 'width=device-width, initial-scale=1',
                'Access-Control-Allow-Origin': '*'
            }
        })
        , new CspHtmlWebpackPlugin({
            'script-src': [ /* "'unsafe-inline'",  */"'self'" ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
            , {
                test: /\.css$/,
                include: [ path.resolve(__dirname, 'src') ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //hmr: true
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
            , /*** SCSS ***/
            {
                test: /\.scss$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }

        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(path.resolve(), 'dist'),
    }
}