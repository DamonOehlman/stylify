var test    = require("tap").test
  , fs      = require('fs')
  , path    = require('path')
  , concat  = require('concat-stream')
  , nib     = require('nib')
  , stylify = require('..');


function transformExampleFile(fileName, options, runTests) {
  var data = '';

  var file = path.join(__dirname, '../examples', fileName);
  fs.createReadStream(file)
      .pipe(stylify(file, options))
      .pipe(concat({encoding: 'string'}, runTests));
}

test('stylify transforms to a css string wrapped in a module', function (t) {
  t.plan(2);

  transformExampleFile("test.styl", null, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body{color:rgba(255,255,255,0.5)}\";"
    );

    t.notOk(/sourceMappingURL/.test(transformed), "source map is not included");
  });
});

test("it doesn't compress the css if compress is set to false", function (t) {
  t.plan(1);

  var options = {
    set: { compress: false }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body {\\n  color: rgba(255,255,255,0.5);\\n}\";"
    );
  });
});

test("it includes inline source maps if enabled", function (t) {
  t.plan(1);

  var options = {
    set: { sourcemap: { comment: false } }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    t.ok(/sourceMappingURL/.test(transformed), "source map is included");
  });
});

test("it plays nicely with nib", function (t) {
  t.plan(1);

  var options = {
    use: [
      nib()
    ],
    set: {
      compress: true,
      sourcemap: false
    }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body{color:rgba(255,255,255,0.5)}\";"
    );
  });

  test('stylify with a module reference transforms to a css string wrapped in a module', function (t) {
    t.plan(2);

    transformExampleFile("bootstrap.styl", null, function (transformed) {
      t.equal(
        transformed,
        "module.exports = \".alert{padding:$alert-padding;margin-bottom:$line-height-computed;border:1px solid transparent;border-radius:$alert-border-radius;}.alert h4{margin-top:0;color:inherit}.alert .alert-link{font-weight:$alert-link-font-weight}.alert > p,.alert > ul{margin-bottom:0}.alert > p + p{margin-top:5px}.alert-dismissable,.alert-dismissible{padding-right:$alert-padding20;}.alert-dismissable .close,.alert-dismissible .close{position:relative;top:-2px;right:-21px;color:inherit}body{background-color:filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff555555', endColorstr='#ff333333', GradientType=1)}\";"
      );

      t.notOk(/sourceMappingURL/.test(transformed), "source map is not included");
    });
  });

});
