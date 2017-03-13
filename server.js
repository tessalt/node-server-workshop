var http = require('http');
var fs = require('fs');
var request = require('request');

var re = /^\/currencies\/(\w+)/;

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

function getLiveValue(symbol, callback) {
  request.get('http://api.fixer.io/latest?base=USD', function (error, response, body) {
    var rates = JSON.parse(body).rates;
    callback(rates[symbol]);
  });
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
    getLiveValue(currency, function (rate) {
      var string = 'currency for ' + match[1] + ' is ' + currency;
      var string2 = '<br> 1 USD = ' + rate + ' ' + currency;
      fs.readFile('./currency.html', 'utf-8', function (error, contents) {
        var output = contents.replace('$contents', string + string2);
        response.write(output, 'utf-8');
        response.end();
      });
    });
  } else {
    response.statusCode = 404;
    response.end();
  }
});

server.listen(8080, function () {
  console.log('server is listening on port 8080');
});
