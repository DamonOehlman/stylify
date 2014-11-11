/* jshint node: true */
'use strict';

/**
  # stylify

  browserify v2 plugin for [stylus](https://github.com/LearnBoost/stylus).

  ## Example Usage

  Usage is very simple when combined with the
  [insert-css](https://github.com/substack/insert-css) (or similar) module.
  Consider the following example, which dynamically creates a couple of
  div tags, and dynamically assigned styles:

  <<< examples/simple.js

  You can see the final statement uses a familar node `require` call to
  bring in a stylus stylesheet:

  <<<css examples/simple.styl

  ##### Adding paths for @require
  Add your stylify config to your application package.json
  add a paths array to your mixins folder etc. Paths can be specified in glob notation.

  <<< docs/stylify-package.json

**/

var stylus  = require('stylus');
var through = require('through');
var glob    = require('glob');
var _       = require('lodash');
var convert = require('convert-source-map');

var appPackage = require(process.cwd() + '/package.json')
    , paths    = [];

if(!!appPackage.stylify && appPackage.stylify.paths instanceof Array){
  paths = _.chain(
    appPackage.stylify.paths.map(function(path){
      return glob.sync(path);
    })
  )
  .flatten()
  .uniq()
  .value();
}

function applyOptions(stylus, options) {
  _(['set', 'include', 'import', 'define', 'use']).forEach(function (method) {
    var option = options[method];

    if (_.isArray(option)) {
      for (var i = 0; i < option.length; i++)
        stylus[method](option[i]);
    }
    else {
      for (var prop in option)
        stylus[method](prop, option[prop]);
    }
  });
}

function compile(file, data, options) {
  var style = stylus(data);

  applyOptions(style, options);

  style
    .set('filename', file);

    // TODO: can't get sourecmaps to work yet
    //.set('sourcemap', { inline: true });

  var compiled = style.render();

  return 'module.exports = ' + JSON.stringify(compiled) + '\n';
}

module.exports = function (file, options) {
  if (!/\.styl$/.test(file)) return through();

  options = _.merge({
    set    : { paths: paths },
    include: [],
    import : [],
    define : {},
    use    : []
  }, options || {});

  var data = '';

  function write (buf) { data += buf }
  function end () {
    var src;

    try {
      src = compile(file, data, options);
    } catch (error) {
      this.emit('error', error);
    }
    this.queue(src);
    this.queue(null);
  }

  return through(write, end);
};
