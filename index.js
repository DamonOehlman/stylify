/* jshint node: true */
'use strict';

var stylus      = require('stylus')
  , through     = require('through')
  , glob        = require('glob')
  , flatten     = require('lodash.flatten')
  , uniq        = require('lodash.uniq')
  , merge       = require('lodash.merge')
  , isObject    = require('lodash.isobject')
  , isArray     = require('lodash.isarray')


var defaultOptions = {
  set    : { paths: [] },
  include: [],
  import : [],
  define : {},
  use    : []
};

// TODO: allow other options than just paths
function getPackageOptions () {
  var appPackage
    , options = {};

  try {
    appPackage = require(process.cwd() + '/package.json');
    if (!appPackage.stylify) throw new Error();
  } catch (e) {
    return options;
  }

  options.set = {
    paths: parsePaths(appPackage.stylify.paths)
  };

  return options;
}

function parsePaths(paths) {
  paths = (isArray(paths) ? paths : []).map(function (path) {
    return glob.sync(path);
  });

  return uniq(flatten(paths));
}

function applyOptions(stylus, options) {
  ['set', 'include', 'import', 'define', 'use'].forEach(function (method) {
    var option = options[method];

    if (isArray(option)) {
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

  var sourcemapSettings = style.get('sourcemap');

  // always use inline source maps if enabled
  if (sourcemapSettings) {
    isObject(sourcemapSettings)
      ? merge(sourcemapSettings, { inline: true, comment: true })
      : sourcemapSettings =        { inline: true, comment: true };

    style.set('sourcemap', sourcemapSettings);
  }

  // enable compression unless explicitly disabled
  if (style.get('compress') !== false)
    style.set('compress', true );

  style.set('filename', file);
  var compiled  = style.render();

  return 'module.exports = ' + JSON.stringify(compiled) + '\n';
}

module.exports = function (file, options) {
  if (!/\.styl$/.test(file)) return through();

  var packageOptions = merge(
    defaultOptions,
    getPackageOptions()
  );

  options = merge(packageOptions, options || {});

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
