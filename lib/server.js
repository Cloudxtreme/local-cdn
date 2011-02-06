var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var mime = require('mime');

var writeResponse = function(response, content, contentType) {
    contentType = contentType || 'text/plain';
    
    response.writeHead(200, {'Content-Type': contentType});
    response.end(content);
};

var writeError = function(response, errorCode) {
    response.writeHead(errorCode, {'Content-Type': 'text/plain'});
    response.end('File Not Found.');
};

exports.serve = function(staticDir, port) {
    port = port || 8000;
    staticDir = __dirname + '/../' + staticDir;
    
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
                var contentType = mime.lookup(filepath);
                
                writeResponse(response, data, contentType);
            });
        });
    
    }).listen(port);
    
    console.log('Server running at http://0.0.0.0:' + port + '/ , mapped to: ' + staticDir);
}
