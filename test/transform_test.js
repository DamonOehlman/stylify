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
  t.plan(1);

  transformExampleFile("test.styl", null, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body {\\n  color: rgba(255,255,255,0.5);\\n}\\n\"\n"
    );
  });
});

test('it compresses the css if compress is set to true', function (t) {
  t.plan(1);

  var options = {
    set: { compress: true }
  };

  transformExampleFile("test.styl", options, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body{color:rgba(255,255,255,0.5)}\"\n"
    );
  });
});
