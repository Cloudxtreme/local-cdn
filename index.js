var url = require('url');
var fs = require('fs');
var mime = require('mime');
var glob = require('glob');

var builder = require('./lib/builder');

exports.config = require('./lib/config');

exports.serve = function(config) {
    return function(req, res, next) {
        var parts = url.parse(req.url).pathname.split('/'),
            contentType = mime.lookup(req.url),
            type = parts[1],
            bundleName = parts[2],
            files = config.getFiles(type, bundleName),
            content,
            extra,
            i;
            
        if (! files) {
            next();
            return;
        }
        
        content = builder.combine(type, files);
        
        for (i = 0; i < config.extras; i++) {
            extra = config.extras[i];
            
            if (typeof extra !== 'function') {
                continue;
            }
            
            content = extra(type, content);
        }
        
        if (config.compress) {
            content = builder.compress(type, content);
        }
        
        writeResponse(res, content, contentType);
    }
}

exports.deploy = function(config) {
    var dir = config.deployDir;
    
    // create the deploy dir if it doesn't exist
    
    try {
        fs.statSync(dir);
    } catch (e) {
        fs.mkdirSync(dir, 0755);
    }
    
    // first go through and create all the bundles
    
    var types = ['js','css'],
        type,
        files,
        bundles,
        bundle,
        content,
        i;
    
    for (i = 0; i < types.length; i++) {
        type = types[i];
        bundles = config.getBundles(type);
        
        // create the directory for the bundle type in the deploy dir
        try {
            fs.statSync(dir + type);
        } catch (e) {
            fs.mkdirSync(dir + type, 0755);
        }
        
        for (bundle in bundles) {
            
            files = config.getFiles(type, bundle);
            
            if (! files) { continue; }
            
            content = builder.combine(type, files);
            
            if (config.compress) {
                content = builder.compress(type, content);
            }
            
            fs.writeFileSync(dir + type + '/' + bundle, content, 'utf-8');
        }
    }
    
    // collect a listing of the file structure and files in the static dir
    var root = config.staticDir;
    var files = glob.globSync(root + '**', glob.GLOB_NO_DOTDIRS|glob.GLOB_STAR);
    var srcPath, relPath, destPath, stat;
    
    // go through and copy the remaining individual static assets, creating
    // the sub directories as needed
    for (i = 0; i < files.length; i++) {
        srcPath = files[i];
        relPath = srcPath.substring(root.length);
        destPath = dir + relPath;
        stat = fs.statSync(srcPath);
        
        // exclude resources that are already part of a generated bundle
        if (config.isBundleFile(relPath)) {
            continue;
        }
        
        if (stat.isDirectory()) {
            try {
                fs.statSync(destPath);
            } catch (e) {
                fs.mkdirSync(destPath, 0755);
            }
        } else if (stat.isFile()) {
            fs.writeFileSync(destPath, fs.readFileSync(srcPath), 'utf-8');
        }
    }
}

function writeResponse(response, content, contentType) {
    contentType = contentType || 'text/html';
    
    response.writeHead(200, {'Content-Type': contentType});
    response.end(content);
};
