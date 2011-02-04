var fs = require('fs');

var uglifyjs = require('uglifyjs'),
    parser = uglifyjs.parser,
    uglify = uglifyjs.uglify;

var basedir = [__dirname, '..', 'test'].join('/');

var files = [];
var contents = fs.readdirSync(basedir);
var i;

// get all the javascript file paths

for (i = 0; i < contents.length; i++) {
    if (contents[i].indexOf('.js') > -1) {
        files.push(basedir + '/' + contents[i]);
    }
}

// concat the js sources, wrap in an enclosing anonymous closure

var source = ['(function() {'];

for (i = 0; i < files.length; i++) {
    source.push(fs.readFileSync(files[i]).toString());
}

source.push('})();');

// parse and compress the combined source

var ast;

try {
    ast = parser.parse(source.join(''));
} catch (e) {
    console.log('Error parsing js source: ' + e);
    return;
}

ast = uglify.ast_mangle(ast);
ast = uglify.ast_squeeze(ast);

var compressed_source = uglify.gen_code(ast);

fs.writeFileSync('compressed.js', compressed_source, encoding='utf-8');
