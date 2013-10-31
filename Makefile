all: base css js
base: | node_modules bower_components
	@jekyll build -c node_modules/roole-browser/package.json,_config.yml > /dev/null
	@support/gen
	@node_modules/.bin/grunt htmlmin
	@cp -R img site

gh-pages:
	git clone -b gh-pages git@github.com:curvedmark/roole-doc.git gh-pages

css: | node_modules
	@node_modules/.bin/roole --prefixes '' -o site/css roo/style.roo
	@node_modules/.bin/autoprefixer site/css/style.css
	@node_modules/.bin/cleancss -o site/css/style.css site/css/style.css
	@node_modules/.bin/cleancss -o site/css/codemirror.css node_modules/codemirror/lib/codemirror.css

js: | node_modules
	@cp node_modules/roole-browser/roole{,.min}.js site
	@mkdir site/js
	@node_modules/.bin/uglifyjs node_modules/codemirror/{lib/codemirror.js,addon/scroll/scrollpastend.js} -cmo site/js/codemirror.js
	@node_modules/.bin/uglifyjs support/{css,roole}-mode.js -cmo site/js/codemirror-modes.js
	@node_modules/.bin/uglifyjs bower_components/enquire/dist/enquire.js -cmo site/js/enquire.js
	@node_modules/.bin/uglifyjs js/*.js -cmo site/js/doc.js

img: | node_modules node_modules/grunt-contrib-imagemin
	@node_modules/.bin/grunt imagemin

publish: | gh-pages site
	@support/publish

site:
	@make

node_modules:
	@npm install

node_modules/grunt-contrib-imagemin:
	@npm install grunt-contrib-imagemin

bower_components:
	@node_modules/.bin/bower install

.PHONY: all base css js img publish