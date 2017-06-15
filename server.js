var http = require('http');
var fs = require('fs');
var request = require('request');

var server = http.createServer();

var currencies = {
  'CAN': 'CAD',
  'USA': 'USD',
  'FRA': 'EUR',
  'SPA': 'EUR'
}

function getLiveValue(symbol, callback) {
  request.get('http://api.fixer.io/latest?base=USD', function(error, response, body) {
    var rates = JSON.parse(body).rates;
    var value = rates[symbol]
    if (symbol === JSON.parse(body).base) {
      value = 1
    }

    callback(value);
  });
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
    var currency = currencies[match[1].toUpperCase()];
    if (currency) {
      getLiveValue(currency, function (value) {
        var output = {
          currency: currency,
          value: value
        }
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(output), 'utf-8');
        response.end();
      })      
    } else {
      response.write('Not a valid country code')
      response.end();
    }
  } else if (request.url === '/home') {
     fs.readFile('index.html', function (error, contents) {
      response.write(contents);
      response.end();
    });
  } else {
    response.write('Not found');
    response.statusCode = 404;
    response.end();
  }

  // if (request.url === '/home') {
  //   fs.readFile('index.html', function (error, contents) {
  //     response.write(contents);
  //     response.end();
  //   });
  // } else {
  //   response.write('Not found');
  //   response.statusCode = 404;
  //   response.end();
  // }
 
});
