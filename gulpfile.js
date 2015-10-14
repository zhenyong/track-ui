var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rimraf = require('rimraf');
var fs = require('fs');

rimraf.sync('dist');


gulp.task('default', function() {
  // place code for your default task here
});
var CORE_SRC = ['core/**/*.js'];
 
gulp.task('compress', function() {

  return gulp.src(CORE_SRC)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .on('end', function () {
    	var size = (fs.statSync('dist/all.js').size/1024).toFixed(2);  
    	console.log(size);
    });
});

gulp.task('watch', function() {

  // 看守所有.scss档
  gulp.watch('core/**/*.js', ['compress']);

});

gulp.start('compress');