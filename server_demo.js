var http = require('http');
var fs = require('fs');
var csv = require('node-csv').createParser();
var querystring = require('querystring');

var server = http.createServer();

var currencies = {
  'CAD': 1.3,
  'GBP': 0.78,
  'JPY': 110.3,
}

var re = /^\/currencies\/(\w+)/;

server.listen(8080, function () {
  console.log('listening on port 8080');
});

server.on('request', function (request, response) {

  request.on('error', function (error) {
    console.error(error);
  });
  response.on('error', function (error) {
    console.error(error);
  });

  var match = request.url.match(re);

  if (match) {
    csv.mapFile('rates.csv', function (error, content) {
      var currency = content.find(function (item) {
        return match[1].toUpperCase() === item.currency;
      });

      if (currency) {
        var output = {
          currency: currency.currency,
          value: currency.value
        }

        var query = request.url.split('?')[1];
        if (query) {
          var input = querystring.parse(query);
          output['converted'] = parseFloat(input.value) * currency.value
        }

        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(output), 'utf-8');
        response.end();
      } else {
        response.statusCode = 400;
        response.write('Not a valid country code')
        response.end();
      }
    })
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
