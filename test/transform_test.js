var test    = require("tap").test
  , fs      = require('fs')
  , path    = require('path')
  , through = require('through')
  , stylify = require('..');


function transformExampleFile(fileName, options, runTests) {
  var data = '';

  var file = path.join(__dirname, '../examples', fileName);
  fs.createReadStream(file)
      .pipe(stylify(file, options))
      .pipe(through(write, end));

  function write (buf) { data += buf; }
  function end ()      { runTests(data); }
}

test('stylify transforms to a css string wrapped in a module', function (t) {
  t.plan(2);

  transformExampleFile("test.styl", null, function (transformed) {
    var parts = transformed.split('/*#');

    t.equal(
      parts[0],
      "module.exports = \"body{color:rgba(255,255,255,0.5)}"
    );

    t.ok(/sourceMappingURL/.test(parts[1]), "source map is included");
  });
});

test("it doesn't compress the css if compress is set to true", function (t) {
  t.plan(1);

  var options = {
    set: { compress: false }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    var parts = transformed.split('/*#');

    t.equal(
      parts[0],
      "module.exports = \"body {\\n  color: rgba(255,255,255,0.5);\\n}\\n"
    );
  });
});

test("it doesn't include source maps if disabled", function (t) {
  t.plan(1);

  var options = {
    set: { sourcemap: false }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    var parts = transformed.split('/*#');

    t.notOk(/sourceMappingURL/.test(transformed), "source map not is included");
  });
});
