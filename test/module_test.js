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

test('stylify with a module reference transforms to a css string wrapped in a module', function (t) {
  t.plan(2);

  transformExampleFile("module.styl", null, function (transformed) {
    t.equal(
      transformed,
      "module.exports = \"body{background-color:#fff;color:#000}\";"
    );

    t.notOk(/sourceMappingURL/.test(transformed), "source map is not included");
  });
});
