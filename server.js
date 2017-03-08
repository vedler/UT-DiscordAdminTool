var http = require('http');

http.createServer(function (req, res) {
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello, world! <br\> UT Discord Admin Tool Test Site');
    
}).listen(process.env.PORT || 8080);
