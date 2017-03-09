var http = require('http');
var fs = require('fs');

var re = /^\/currency\/(\w+)/;

var server = http.createServer(); // creates an eventemitter

var currencies = {
  'CAN': 'CAD',
  'USA': 'USD',
  'FRA': 'EUR',
  'ENG': 'EUR',
  'SPA': 'EUR',
  'GER': 'EUR',
  'MEX': 'MXN',
  'RUS': 'RUB'
}

function currencyForCountry(country) {
  return currencies[country] || '';
}

server.on('request', function (request, response) {
  request.on('error', function(err) {
    console.error(err.stack);
  });

  response.on('error', function(err) {
    console.error(err);
  });

  var match = request.url.match(re);

  if (match) {
    var currency = currencyForCountry(match[1]);
    var string = 'currency for ' + match[1] + ' is ' + currency;
    fs.readFile('./currency.html', 'utf-8', function (error, contents) {
      var output = contents.replace('$contents', string);
      response.write(output, 'utf-8');
      response.end();
    });
  } else {
    response.statusCode = 404;
    response.end();
  }

});

server.listen(8080);
