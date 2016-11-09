var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Storage = {
  add: function(name, username) {
    var item = {username: username, name: name, id: this.setId};
    this.items.push(item);
    this.setId += 1;
    return item;
  } 
};

var createStorage = function() {
  var storage = Object.create(Storage);
  storage.items = [];
  storage.setId = 1;
  return storage;
};

var storage = createStorage();

storage.add('Broad beans', 'John');
storage.add('Tomatoes', 'John');
storage.add('Peppers', 'Steve');

console.log(storage);


var app = express();
app.use(express.static('public'));

app.get('/users/:username', function(request, response) {
  var username = request.params.username;
  var userList = [];
  storage.items.forEach(function(items) {
    if(items.username === username) {
      userList.push({name: items.name, id: items.id});
    };
  });
  response.json({username: username, items: userList});
});

app.get('/items', function(request, response) {
    response.status(200).json(storage.items);
});

app.post('/items', jsonParser, function(request, response) {
    if (!('name' in request.body)) {
        return response.sendStatus(400);
    }

    var item = storage.add(request.body.name);
    response.status(201).json(item);
});

app.delete('/items/:id', function(request, response) {
  var id = request.params.id;
  var statusCode = 404;
  
  // expensive [good solution]
  storage.items = storage.items.filter(function(item) {
    if(item.id == id) {
      statusCode = 200;
    }
   return item.id!=id;
  });
  
  if(statusCode === 200) {
    response.json(storage.items);
  }
  else
    response.status(statusCode).json({status:statusCode, message: http.STATUS_CODES(404), type:'internal'});
});

app.put('/items/:id', jsonParser, function(request, response) {
  var id = request.params.id;
  var idFound = false;
  if(typeof(id) != "number" || typeof(request.body.name) != "string") {
    response.send("The request has failed.");
  }
  else {
  storage.items.forEach(function(item) {
    if(item.id == id) {
      item.name = request.body.name;
      idFound = true;
    }
  });
  if(idFound === false) {
    storage.items.push({username: 'John', name: request.body.name, id: id});
  }
  response.json(storage.items);
  }
});

app.listen(process.env.PORT || 8080, process.env.IP);

exports.app = app;
exports.storage = storage;