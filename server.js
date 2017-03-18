var http = require('http');
var fs = require('fs');
var request = require('request');

var server = http.createServer();

var re = /^\/currencies\/(\w+)/;

var currencies = {
  'CAN': 'CAD',
  'USA': 'USD',
  'FRA': 'EUR',
}

function getValue(currency, callback) {
  request.get('http://api.fixer.io/latest?base=USD', function (error, response, body) {
    var value = JSON.parse(body).rates[currency];

    callback(value);
  });
}

server.on('request', function(request, response) {

  request.on('error', function(err) {
    console.error(err);
  });

  response.on('error', function(err) {
    console.error(err);
  });

  var match = request.url.match(re);

  if (match) {
    var currency = currencies[match[1]] || '';


    getValue(currency, function(value) {
      var sentence = `The currency for ${match[1]} is ${currency}. <br> 1 USD = ${value} ${currency}`;

      fs.readFile('index.html', 'utf-8', function(error, contents) {
        response.write(contents.replace('$contents', sentence));
        response.end();
      });
    });

  } else {
    response.write('not found');
    response.statusCode = 404;
    response.end();
  }


});

server.listen(8080, function() {
  console.log('server is listening');
});
