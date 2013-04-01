# stylify

browserify v2 plugin for stylus.

Use in combination with [insert-css](https://github.com/substack/insert-css) to use [stylus](https://github.com/LearnBoost/stylus) with your browserified modules:

```js
var css = require('./default.styl'),
    insertCss = require('insert-css');

insertCss(css);
```

## Known Issues

- Currently has a compatibility issue when the [brfs](https://github.com/substack/brfs) transform is also used.