var http = require('http');
var fs = require('fs');
var csv = require('node-csv');
var querystring = require('querystring');

var parser = csv.createParser();

var server = http.createServer();

var re = /^\/currencies\/(\w+)/;

server.on('request', function(request, response) {

  request.on('error', function(error) {
    console.error(error);
  });

  response.on('error', function(error) {
    console.error(error);
  });

  var match = request.url.match(re);

  if (match) {
    parser.mapFile('rates.csv', function (error, rows) {
      var output = rows.find(function(row) {
        return row.currency === match[1];
      });
      var query = request.url.split('?')[1];

      if (query) {
        var amount = querystring.parse(query);
        output.amount = parseFloat(amount.value) * output.value;
      }

      if (output) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(output), 'utf-8');
        response.end();
      } else {
        response.statusCode = 400;
        response.write('Not a valid currency');
        response.end();
      }
    });
  } else if (request.url === '/home') {
    fs.readFile('index.html', function (error, contents) {
      response.write(contents);
      response.end();
    });
  } else {
    response.statusCode = 404;
    response.write('Not found');
    response.end();
  }
});

server.listen(8080, function () {
  console.log('server is listening on 8080');
});