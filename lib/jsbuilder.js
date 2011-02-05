var fs = require('fs'),
    uglifyjs = require('uglifyjs'),
    parser = uglifyjs.parser,
    uglify = uglifyjs.uglify;

exports.combine = function(files, wrap) {
    var source = [],
        i;
    
    for (i = 0; i < files.length; i++) {
        source.push(fs.readFileSync(files[i]).toString());
    }
    
    if (wrap) {
        source.splice(0, 0, '(function() {');
        source.push('})();');
    }
    
    return source.join('');
}

exports.compress = function(source) {
    var ast;

    try {
        ast = parser.parse(source);
    } catch (e) {
        console.log('Error parsing js source: ' + e);
        return source;
    }

    ast = uglify.ast_mangle(ast);
    ast = uglify.ast_squeeze(ast);

    return uglify.gen_code(ast);
}


