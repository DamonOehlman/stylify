# stylify

browserify v2 plugin for stylus.

Use in combination with [insert-css](https://github.com/substack/insert-css) to use [stylus](https://github.com/LearnBoost/stylus) with your browserified modules:

```js
var css = require('./default.styl'),
    insertCss = require('insert-css');

insertCss(css);
```

## Using in Conjuction with brfs (and other AST focused transforms)

If you are using stylify or another transform module that works by requiring non-JS files, then it's important to note that `brfs` needs to be applied **after** stylify.  This is because `brfs` will perform analysis on the [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree) of what it expects will be a JS file.  When the `stylify` transform is applied first, this is fine, but if `brfs` attempts to work it's magic on a raw stylus file your browerification will fail.