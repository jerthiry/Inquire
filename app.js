'use strict';

var express = require('express'),
    engines = require('consolidate'),
    path = require('path'),
    routes = require('./routes'),
    mongo = require('mongodb').MongoClient,
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var password = process.argv.slice(2)[0];
if(!password) throw new Error("You need to specify the database password (npm start -- <password>)");
var url = "mongodb://inquire:"+password+"@cluster0-shard-00-00-vdkgp.mongodb.net:27017"+
          ",cluster0-shard-00-01-vdkgp.mongodb.net:27017,cluster0-shard-00-02-vdkgp.mongodb.net:27017"+
          "/inquire?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"

mongo.connect(url, function(error, database) {
  if(!error) {
    initApp(database.db('inquire'));
  }
  else {
    console.log(error);
  }
});

function initApp (db) {
  var app = express();
  // Set DB
  app.set('db', db);
  // Home and port
  app.set('home', __dirname);
  app.set('port', process.env.PORT || 3000);
  // Rendering engine - HTML with hogan.js
  app.engine('html', engines.hogan);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'views'));

  // Middleware for logs
  app.use(logger('dev'));

  // Middleware to support cookies
  app.use(cookieParser());

  // Middleware to handle POST req
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  routes(app);

  app.listen('3000');
  console.log('Listening on port 3000');
}
