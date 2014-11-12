/* jshint node: true */
'use strict';

var stylus  = require('stylus')
  , through = require('through')
  , glob    = require('glob')
  , _       = require('lodash')
  , convert = require('convert-source-map');


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
  paths = (_.isArray(paths) ? paths : []).map(function (path) {
    return glob.sync(path);
  });

  return _.chain(paths).flatten().uniq().value();
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

  style.set('filename', file);

  // enable source maps unless explicitly disabled
  if (style.get('sourcemap') !== false)
    style.set('sourcemap', { inline: true } );

  // enable compression unless explicitly disabled
  if (style.get('compress') !== false)
    style.set('compress', true );

  var compiled  = style.render()
    , sourcemap = convert.fromComment(compiled);

  if (style.get('compress') === false)
    compiled = 'module.exports = ' + JSON.stringify(compiled) + '\n';
  else
    compiled = 'module.exports = ' + JSON.stringify(compiled) + '\n' +
                                     sourcemap.toComment()    + '\n';

  return compiled;
}

module.exports = function (file, options) {
  if (!/\.styl$/.test(file)) return through();

  var packageOptions = _.merge(
    defaultOptions,
    getPackageOptions()
  );

  options = _.merge(packageOptions, options || {});

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
