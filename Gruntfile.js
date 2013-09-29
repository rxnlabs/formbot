module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            my_target: {
                files: {
                    'dest/fillForms.min.js': ['src/fillForms.js']
                }
            },
            options: {
                mangle: false
            }
        },
        'ftp_upload': {
            build: {
                auth: {
                    host: 'www.mariacamilleri.com',
                    port: 21,
                    authKey: 'mariaServer'
                },
                src: ['dest/fillForms.min.js'],
                dest: '/www/sideprojects/bookmarklets'
            }
        },
        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['uglify'],
                options: {
                spawn: false,
            },
          },
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Load the plugin that uploads the minified version of the bookmarklet to a hosting server
    grunt.loadNpmTasks('grunt-ftp-upload');

    //load the plugin that runs predefined tasks whenever a watched file is added, changed or removed.
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['watch']);

};