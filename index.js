var stylus = require('stylus'),
    through = require('through');

function compile(file, data) {
    var renderer = stylus(data, { filename: file });

    return 'module.exports = ' + JSON.stringify(renderer.render()) + ';';
}

module.exports = function (file) {
    var data = '';

    function write (buf) { data += buf; }
    function end () {
        this.queue(compile(file, data));
        this.queue(null);
    }

    if (!/\.styl$/.test(file)) return through();

    return through(write, end);
};