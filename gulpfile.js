var gulp 				= require('gulp'), // Подключаем Gulp
		sass 				= require('gulp-sass'), //Подключаем Sass пакет
		browserSync = require('browser-sync'), // Подключаем Browser Sync
		concat			= require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
		cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
		rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
		del         = require('del'), // Подключаем библиотеку для удаления файлов и папок
		imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache       = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов

gulp.task('sass', function(){ //Создаем таск "sass"
	return gulp.src('app/css/*.sass') //Берем источник
		.pipe(sass()) //Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) //Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('scripts', function() {
	return gulp.src('app/js/*.js')
	.pipe(browserSync.reload({stream: true}))
})

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({stream: true}))
})

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browser Sync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	})
});
// gulp.task('css-libs', function() {
//     return gulp.src('app/sass/style.sass') // Выбираем файл для минификации
// 		.pipe(cssnano()) // Сжимаем
// 		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
// 		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
// });

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
	.pipe(cache(imagemin([  // Сжимаем их с наилучшими настройками с учетом кеширования
		imagemin.optipng({optimizationLevel: 7}),
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.svgo({ plugins: [{removeViewBox: true},{cleanupIDs: false}]}),
	])))
	.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('prebuild', async function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/*.css'
        ])
    .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('init', function(){
  git.init(function (err) {
    if (err) throw err;
  });
});

gulp.task('watch', function() {
	gulp.watch('app/css/*.sass', gulp.parallel('sass')); // Наблюдение за sass файлами
	gulp.watch('app/*.html', gulp.parallel('code')); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/*.js', gulp.parallel('scripts')); // Наблюдение за главным JS файлом 
})

gulp.task('default', gulp.parallel('sass', 'scripts', 'browser-sync', 'watch'));
gulp.task('build', gulp.parallel('prebuild', 'clean', 'img', 'sass', 'scripts'));
