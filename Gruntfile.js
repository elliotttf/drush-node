module.exports = function (grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    nodeunit: {
      all: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      files: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
      },
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Default task.
  grunt.registerTask('default', [ 'jshint', 'nodeunit' ]);

  grunt.registerTask('test', [ 'nodeunit' ]);
};
