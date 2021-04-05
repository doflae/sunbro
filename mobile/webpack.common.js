const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production'

const config = {
    entry: {
        index: [path.resolve(__dirname, 'src/index.js'),"@babel/polyfill"]
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
        filename: '[name]-[hash].js',
        chunkFilename: 'chunk-[chunkhash].js',
    },
    module: {
        rules: [
            {
                test: /\.js|\.jsx$/,
                exclude: [path.resolve(__dirname, 'node_modules')],
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader:'file-loader'
            },
            {
                test: /\.svg$/,
                use:['@svgr/webpack'],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({cleanAfterEveryBuildPatterns: ['public']}),
        new HtmlWebpackPlugin({
            minify: isProd
                ? true
                : {
                    collapseWhitespace: true,
                    removeComments: true,
                    useShortDoctype: true,
                    minifyCSS: true,
                },
            template: './src/static/index.html',
            title: 'humorpage',
            description: `humorpage`,
            url: 'https://seono.io',
        })
    ]
};

module.exports = config