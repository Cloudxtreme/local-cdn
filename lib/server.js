var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var writeResponse = function(response, content, contentType) {
    contentType = contentType || 'text/plain';
    
    response.writeHead(200, {'Content-Type': contentType});
    response.end(content);
};

var writeError = function(response, errorCode) {
    response.writeHead(errorCode, {'Content-Type': 'text/plain'});
    response.end('File Not Found.');
};

var guessContentType = function(str) {
    var parts = str.split('.');
    var ext = parts[parts.length-1];
    var ct;
    
    switch(ext) {
        case 'ico':  ct = 'image/x-icon'; break;
        case 'css':  ct = 'text/css'; break;
        case 'js':   ct = 'application/javascript'; break;
        case 'html': ct = 'text/html'; break;
        default: ct = 'text/plain';
    }
    
    return ct;
}

exports.serve = function(staticDir, port) {
    port = port || 8000;
    
    http.createServer(function (request, response) {
        // parse the request to get the path
        var reqParts = url.parse(request.url, true);
        var urlpath = reqParts.pathname;
        var filepath = staticDir + urlpath;
        
        console.log('requesting: ' + filepath);
        
        path.exists(filepath, function(staticFileExists) {
            if (! staticFileExists) {
                writeError(response, 404);
            }
            
            fs.readFile(filepath, function(err, data) {
                var contentType = guessContentType(urlpath);
                
                writeResponse(response, data, contentType);
            });
        });
    
    }).listen(port);
    
    console.log('Server running at http://0.0.0.0:' + port + '/');
}
