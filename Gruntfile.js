module.exports = function (grunt) {
	grunt.initConfig({
		htmlmin: {
			options: {
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeOptionalTags: true
			},
			files: {
				expand: true,
				cwd: 'site',
				src: ['**/*.html'],
				dest: 'site'
			}
		},
		imagemin: {
			files: {
				expand: true,
				cwd: 'img',
				src: ['**/*.png'],
				dest: 'img'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
};