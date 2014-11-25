module.exports = function (grunt) {

  grunt.initConfig({});

  grunt.config( 'react', require('./grunt/react.js') );
  grunt.config( 'watch', require('./grunt/watch.js') );

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');

  grunt.registerTask('dist', ['react:dist']);
  grunt.registerTask('examples', ['react:examples']);
  grunt.registerTask('dev', ['watch']);

};
