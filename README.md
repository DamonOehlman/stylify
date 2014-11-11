# stylify

browserify v2 plugin for [stylus](https://github.com/LearnBoost/stylus).


[![NPM](https://nodei.co/npm/stylify.png)](https://nodei.co/npm/stylify/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable)

## Example Usage

Usage is very simple when combined with the
[insert-css](https://github.com/substack/insert-css) (or similar) module.
Consider the following example, which dynamically creates a couple of
div tags, and dynamically assigned styles:

```js
var insertCss = require('insert-css');
var crel = require('crel');

// create some dom elements to demo our styles
var elements = ['square', 'rect'].map(function(cls) {
  return crel('div', { class: 'box ' + cls });
}).forEach(document.body.appendChild.bind(document.body));

// insert our stylus css into our app
insertCss(require('./simple.styl'));
```

You can see the final statement uses a familar node `require` call to
bring in a stylus stylesheet:

```css
sidelength = 40px
boxborder = black

body
  margin 0
  padding 0

.box
  border: 1px solid boxborder
  margin: 5px

.square
  width: sidelength
  height: sidelength

.rect
  width: sidelength * 2
  height: sidelength
```

##### Adding paths for @require
Add your stylify config to your application package.json
add a paths array to your mixins folder etc. Paths can be specified in glob notation.

```json
"stylify": {
  "paths": [
    "application/stylus/**/"
  ]
}

```

##### Advanced options

Options can be [passed](https://github.com/substack/node-browserify#user-content-btransformtr-opts) in the follwing form:

```js
{
  set    : { setting: value },
  include: [ path, ... ],
  import : [ path, ... ],
  define : { key: value },
  use    : [ module, ... ]
}
```

where each key corresponds to a stylus method [described here](http://learnboost.github.io/stylus/docs/js.html).

Here is an example using the javascript api:

```js

var nib = require 'nib';
var browserify = require 'browserify';

// create a browserify bundle
var bundle = browserify({ ... });

// register the stylify tranforms with options
bundle.transform('stylify', {
  use: [ nib() ],
  set: { compress: true }
});
```

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
