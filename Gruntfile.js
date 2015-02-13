'use strict';
var fs = require('fs');

module.exports = function(grunt) {

  var model = grunt.option('model') ? '?model=' + grunt.option('model') : '';

  console.log(model);

  if (model) {
    if (!fs.existsSync(grunt.option('model'))) {
      fs.createReadStream('models/default.jscad').pipe(fs.createWriteStream(grunt.option('model')));
    }
  }

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
