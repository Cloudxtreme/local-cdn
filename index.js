var url = require('url');
var fs = require('fs');
var mime = require('mime');

var config = require('./lib/config');
var builder = require('./lib/builder');

function writeResponse(response, content, contentType) {
    contentType = contentType || 'text/html';
    
    response.writeHead(200, {'Content-Type': contentType});
    response.end(content);
};

exports.serve = function(config) {
    return function(req, res, next) {
        var parts = url.parse(req.url).pathname.split('/'),
            contentType = mime.lookup(req.url),
            type = parts[1],
            bundleName = parts[2],
            files = config.getFiles(type, bundleName),
            content;
            
        if (! files) {
            next();
            return;
        }
        
        content = builder.combine(type, files);
        
        if (config.compress) {
            content = builder.compress(type, content);
        }
        
        writeResponse(res, content, contentType);
    }
}

exports.deploy = function(config) {
    var dir = config.deployDir;
    
    try {
        fs.statSync(dir);
    } catch (e) {
        fs.mkdirSync(dir, 0755);
    }
    
    var js = config.js;
    
    // TODO create all js and css bundles, copy everything else
}

exports.config = config;
