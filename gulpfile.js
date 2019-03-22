// npm 패키지 설치
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const htmlLint = require("gulp-w3c-html-validator");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const uglifyjs = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const sprite = require("gulp.spritesmith");
const merge = require("merge-stream");
const imagemin = require("gulp-imagemin");
const del = require("del");

const webserver = () => {
	browserSync.init({
		server: {
			baseDir: "dist"
		}
	});
};

const html = () => {
	return gulp
		.src("assets/**/*.html", {
			since: gulp.lastRun(html)
		})
		.pipe(htmlLint())
		.pipe(gulp.dest("dist"));
};

const css = () => {
	return gulp
		.src("assets/css/**/*.css", { since: gulp.lastRun(css) })
		.pipe(postcss([autoprefixer, cssnano]))
		.pipe(gulp.dest("dist/css"));
};

const scss = () => {
	return gulp
		.src("assets/sass/**/*.scss", { since: gulp.lastRun(scss) })
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(postcss([autoprefixer]))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("dist/css"));
};

const js = () => {
	return gulp
		.src("assets/js/**/*.js", { since: gulp.lastRun(js) })
		.pipe(plumber())
		.pipe(uglifyjs())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("dist/js"));
};

const spriteTask = () => {
	const spriteData = gulp
		.src("assets/img/sprite/*.{png,jpg,gif}", {
			since: gulp.lastRun(sprite)
		})
		.pipe(
			sprite({
				imgName: "sprite.png",
				cssName: "sprite.css"
			})
		);

	const imgStream = spriteData.img.pipe(gulp.dest("dist/img"));

	const cssStream = spriteData.css
		.pipe(sourcemaps.init())
		.pipe(postcss([cssnano]))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("dist/css"));
	return merge(imgStream, cssStream);
};

const fonts = () => {
	return gulp
	    .src("assets/fonts/**/*.{eot,svg,ttf,woff}",{ since: gulp.lastRun(fonts)})
	    .pipe(gulp.dest("dist/fonts"));
};
const image = () => {
	return gulp
		.src(["assets/img/**", "!assets/img/sprite/**"], {
			since: gulp.lastRun(image)
		})
		.pipe(imagemin())
		.pipe(gulp.dest("dist/img"));
};

const clean = () => {
	return del("dist");
};

const watchTask = () => {
	gulp.watch("assets/**/*.html", html);
	gulp.watch("assets/fonts/**", fonts);
	gulp.watch("assets/css/*.css", css);
	gulp.watch("assets/scss/*.scss", scss);
	gulp.watch("assets/js/*.js", js);
	gulp.watch(["assets/img/**", "!assets/img/sprite/**"], image);
};

exports.default = gulp.series(gulp.parallel(webserver, watchTask));

exports.build = gulp.series(
	clean,
	gulp.parallel(html, fonts, css, scss, spriteTask, image, js)
);
