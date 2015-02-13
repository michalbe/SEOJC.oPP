'use strict';

module.exports = function(grunt) {

  var model = grunt.option('model') ? '?model=' + grunt.option('model') : '';

  console.log(model);

  grunt.initConfig({
    browserSync: {
      bsFiles: {
        src : [grunt.option('model'), 'js/custom/*js']
      },
      options: {
        startPath: model,
        server: {
          baseDir: './'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.registerTask('default', ['browserSync']);

};
