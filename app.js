var port = process.env.HTTP_PORT || 3000;

var http = require("http");
var tokens = require('./lib/tokens');
var worker = require('./lib/worker');

var server = http.createServer(function(req, res) {
  if(req.method !== 'POST') {
    console.log('WARN: Invalid request method', req.method);
    res.writeHead(400, 'Bad Request', {"Content-Type": "text/plain"});
    res.end();
    return;
  }
  var reqToken = req.url.substr(1);
  var token = tokens.get(reqToken);

  if(!token) {
    console.log('WARN: Token not found', reqToken);
    res.writeHead(404, 'Not Found', {"Content-Type": "text/plain"});
    res.end();
  } else {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk.toString();
    });
    req.on('end', function() {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('ERROR: Invalid JSON posted to', req.url);
        console.error(body);
        res.writeHead(400, 'Invalid JSON', {"Content-Type": "text/plain"});
        res.end();
        return;
      }

      res.writeHead(200, 'OK', {"Content-Type": "text/plain"});
      res.end();
      worker.exec(token, body);
    });
  }
  
});

tokens.loadTokens(function() {
  server.listen(port);
  console.log("Server is listening on port", port);
});
