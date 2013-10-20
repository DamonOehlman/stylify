var insertCss = require('insert-css');
var crel = require('crel');

// create some dom elements to demo our styles
var elements = ['square', 'rect'].map(function(cls) {
  return crel('div', { class: 'box ' + cls });
}).forEach(document.body.appendChild.bind(document.body));

// insert our stylus css into our app
insertCss(require('./simple.styl'));