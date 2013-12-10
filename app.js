
/**
 * Module dependencies.
 */

var express = require('express')
   , nano    = require('nano')('http://<User name>:<Password>@<VM IP>:<VM PORT>')
   , app     = module.exports = express.createServer()
   , db_name = "my_couch"
   , db      = nano.use(db_name);

var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

nano.db.create(db_name, function(err, body) {
  if (!err) {
    console.log('database created!');
  }
});

// Initialize database connection
var tb = nano.use(db_name);

// App root URL will redirect to Users list
app.get('/', function(req, res){
  tb.fetch( { revs_info: true }, function (error, body, headers) {
  	console.log(body.rows);   
    if(error) { return response.send(error.message, error['status-code']); }
    res.render('users', {users: body.rows, title: 'App42PaaS Express MySql Application'});
  });	
});

// Add a new User
app.get("/users/new", function (req, res) {
  res.render("new", {
    title: 'App42PaaS Express MongoDb Application'
  });
});

// Save the Newly created User
app.post("/users", function (req, res) {
  var doc = {
  	name: req.body.name,
    email: req.body.email,
    des: req.body.des,
    type: 'User'
  };

  tb.insert(doc, '', function (error, body, headers) {
    res.redirect('/');
  });
});

// http server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
