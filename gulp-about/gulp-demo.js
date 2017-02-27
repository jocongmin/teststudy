// 引入 gulp
var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var spriter = require('gulp-css-spriter');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var base64 = require('gulp-base64');
var webserver = require('gulp-webserver'); // 本地服务器
var autoprefixer = require('gulp-autoprefixer');
var rename = require("gulp-rename");
var cssmin = require('gulp-cssmin');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var pngquant = require('imagemin-pngquant');
var gulpWeinre = require('gulp-weinre');

/*browserSync = require("browser-sync");*/

// 自动刷新 browser-sync start
gulp.task('browser', function() {
    browserSync({
        // host: 172.16.157.1,
        port: 8082,
        open: true,
        // 路径显示/d 开始
        startPath: "/d",
        //timestamps:false,
        server: {
            directory: true,
            routes: {
                '/f': "F:/www/xg/xingou_v1_front/xgou/*.*"
            },
            middleware: function(req, res, next) {
                console.log("中间件");
                next();
            },
            baseDir: './'
        },
        // 指定浏览器
        // browser: "google chrome" // 或  ["google chrome","firefox"]
        // 延迟刷新，默认0
        reloadDelay: 1,
        // 是否载入css修改，默认true
        injectChanges: false
    });
});
gulp.task('bro', function() {
    gulp.src('./')
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('abc', ['bro', 'browser'], function() {
    gulp.watch('./dist/**', ['bro']);
});

gulp.task('webser', function() {
    connect.server({
        root: './',
        port: 8080,
        livereload: true
    });
});
// 注册任务
gulp.task('webserver', function() {
    gulp.src('./') // 服务器目录（./代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            livereload: true, // 启用LiveReload
            directoryListing: true,
            open: true // 服务器启动时自动打开网页
        }));
});
gulp.task('weinre', function() {
    gulpWeinre({
        httpPort: '8086',
        boundHost: '192.168.7.143'
    })
})

// 编译Sass
gulp.task('sass', function() {
    gulp.src(['./scss/*.scss'])
        .pipe(concat('style.scss'))
        .pipe(gulp.dest('./css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 6 Chrome versions', 'last 3 Safari versions', 'iOS >= 5', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cssmin())
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./css'))
        .pipe(connect.reload());
});

// 监听任务
gulp.task('watch', function() {
    /* gulp.watch('*.html', ['html']); */ // 监听根目录下所有.html文件
    gulp.watch('./scss/*.scss', ['sass']);
});

// 默认任务
gulp.task('default', ['webser', 'watch', 'weinre']);

gulp.task('sprite', function() {

    var timestamp = +new Date();
    //需要自动合并雪碧图的样式文件
    return gulp.src('./scss/*.scss')
        .pipe(spriter({
            // 生成的spriter的位置
            'spriteSheet': './img/' + timestamp + '.png',
            // 生成样式文件图片引用地址的路径
            // 如下将生产：backgound:url(../images/sprite20324232.png)
            'pathToSpriteSheetFromCSS': '../img/' + timestamp + '.png'
        }))
        //产出路径
        .pipe(gulp.dest('./test'));
});



gulp.task('icon', function() {
    return gulp.src('./img/icon/*.png') //需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'img/sprite.png', //保存合并后图片的地址
            cssName: 'scss/_bg.scss', //保存合并后对于css样式的地址
            padding: 20, //合并时两个图片的间距
            algorithm: 'binary-tree', //注释1
            cssTemplate: function(data) {
                var arr = [];

                data.sprites.forEach(function(sprite) {
                    var $width = parseInt(sprite.px.width) / 2 + 2;
                    var $height = parseInt(sprite.px.height) / 2 + 2;
                    var $ofx = parseInt(sprite.px.offset_x) / 2 + 1;
                    var $ofy = parseInt(sprite.px.offset_y) / 2 + 1;
                    var $tw = sprite.total_width / 2;
                    var $th = sprite.total_height / 2;
                    arr.push(".bg-" + sprite.name +
                        "{" +
                        "background-image: url(" + sprite.escaped_image + ");" +
                        "background-position: " + $ofx + "px " + $ofy + "px;" +
                        "width:" + $width + "px;" +
                        "height:" + $height + "px;" +
                        "display:" + "inline-block;" +
                        "background-size:" + $tw + "px " + $th + "px;" +
                        "background-repeat:" + "no-repeat;" +
                        "}\n");
                });
                return arr.join("");
            }

        }))
        .pipe(gulp.dest('./'));
});
gulp.task('imagemin', function() {
    return gulp.src('./img/*.png')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant({
                quality: '65-80'
            })]
        }))
        .pipe(gulp.dest('./img/'))
});




gulp.task('base', ['sass'], function() {
    return gulp.src('./scss/_reset.scss')
        .pipe(base64({
            baseDir: 'xgou',
            extensions: ['png'],
            maxImageSize: 20 * 1024,
            debug: false
        }))
        .pipe(gulp.dest('./scss/'));
});
