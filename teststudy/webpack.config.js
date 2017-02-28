var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
var SpritesmithPlugin = require('webpack-spritesmith');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var templateFunction = function(data) {
    var shared = '.bg { background-image: url(I) }'
        .replace('I', data.sprites[0].image);

    var perSprite = data.sprites.map(function(sprite) {
        var $name = sprite.name,
            $width = parseInt(sprite.px.width) / 2 + 2,
            $height = parseInt(sprite.px.height) / 2 + 2,
            $ofx = parseInt(sprite.px.offset_x) / 2 + 1,
            $ofy = parseInt(sprite.px.offset_y) / 2 + 1,
            $tw = sprite.total_width / 2,
            $th = sprite.total_height / 2;
        return '.bg-N { width: Wpx; height: Hpx; background-position: Xpx Ypx; background-size:Mpx,Npx;background-repeat:no-repeat;display:inline-block;}'
            .replace('N', $name)
            .replace('W', $width)
            .replace('H', $height)
            .replace('X', $ofx)
            .replace('Y', $ofy)
            .replace('M', $tw)
            .replace('N', $th);
    }).join('\n');

    return shared + '\n' + perSprite;
};

module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname+'/dist/',
        filename: "bundle.js",
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            use: 'babel-loader?presets[]=react,presets[]=es2015',
            exclude: /node_modules/
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                loader: "css-loader!autoprefixer-loader?{browsers:['last 6 Chrome versions', 'last 3 Safari versions', 'iOS >= 5', 'Android >= 4.0']}!sass-loader",
            }),
        }, {
            test: /\.png$/,
            use: [
                'file-loader?name=i/[hash].[ext]'
            ]
        }]
    },
    plugins: [
        // new webpackUglifyJsPlugin({
        //     cacheFolder: path.resolve(__dirname, 'public/cached_uglify/'),
        //     debug: true,
        //     minimize: true,
        //     sourceMap: false,
        //     output: {
        //         comments: false
        //     },
        //     compressor: {
        //         warnings: false
        //     }
        // }),
        new ExtractTextPlugin('style.css'),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src/img/icon'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'src/img/sprite.png'),
                css: [
                    [path.resolve(__dirname, 'src/scss/sprite.scss'), {
                        format: 'function_based_template'
                    }]
                ]
            },
            customTemplates: {
                'function_based_template': templateFunction,
            },
            apiOptions: {
                cssImageRef: "sprite.png"
            },
        }),
        new HtmlWebpackPlugin({
            title: 'index',
            hash:true,
            template: 'index.ejs', // Load a custom template (ejs by default see the FAQ for details)
        })
    ]
}
