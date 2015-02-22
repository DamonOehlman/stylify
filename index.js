/* jshint node: true */
'use strict';

var stylus = require('stylus'),
  through = require('through'),
  glob = require('glob'),
  flatten = require('lodash.flatten'),
  uniq = require('lodash.uniq'),
  merge = require('lodash.merge'),
  isArray = require('lodash.isarray');


var defaultOptions = {
  set: {
    paths: []
  },
  include: [],
  import: [],
  define: {},
  use: []
};

var defaultSourceMapSettings = {
  inline: true,
  comment: true
};

// TODO: allow all options
function getPackageOptions() {
  var pkg;
  var options = {};

  try {
    pkg = require(process.cwd() + '/package.json');
  } catch (e) {}

  if (!pkg || !pkg.stylify) {
    return options;
  }

  if (pkg.stylify.use) {
    options.use = pkg.stylify.use;
  }
  if (pkg.stylify.paths) {
    options.set = {
      paths: pkg.stylify.paths
    };
  }
  return options;
}

function parsePaths(paths) {
  paths = isArray(paths) ? paths : [];
  return uniq(flatten(paths.map(function(path) {
    return glob.sync(path);
  })));
}

function resolveUses(uses) {
  if (!isArray(uses)) {
    uses = [uses];
  }
  return uses.map(function(mod) {
    if (typeof mod === 'string') {
      return require(mod);
    }
    return mod;
  });
}

function applyOptions(stylus, options) {
  ['set', 'include', 'import', 'define', 'use'].forEach(function(method) {
    var option = options[method];

    if (isArray(option)) {
      for (var i = 0; i < option.length; i++)
        stylus[method](option[i]);
    } else {
      for (var prop in option)
        stylus[method](prop, option[prop]);
    }
  });
}

function compile(file, data, options) {
  var style = stylus(data);

  applyOptions(style, options);

  var sourceMapSettings = style.get('sourcemap');

  // always use inline source maps if enabled
  if (typeof sourceMapSettings === 'object') {
    sourceMapSettings = merge(sourceMapSettings, defaultSourceMapSettings);
  }
  if (sourceMapSettings === true) {
    sourceMapSettings = defaultSourceMapSettings;
  }

  style.set('sourcemap', sourceMapSettings);

  // enable compression unless explicitly disabled
  style.set('compress', style.get('compress') !== false);
  style.set('filename', file);
  var compiled = style.render().trim();

  return 'module.exports = ' + JSON.stringify(compiled) + ';';
}

module.exports = function (file, options) {
  if (!/\.styl$/.test(file)) return through();

  var data = '';
  var packageOptions = merge(
    defaultOptions,
    getPackageOptions()
  );

  options = merge(packageOptions, options || {});
  options.use = resolveUses(options.use);
  if (options.set.paths) {
    options.set.paths = parsePaths(options.set.paths);
  }

  function write(buf) {
    data += buf
  }

  function end() {
    try {
      this.queue(compile(file, data, options));
      this.queue(null);
    } catch (err) {
      this.emit('error', err);
    }
  }

  return through(write, end);
};