'use strict';

var express = require('express'),
    engines = require('consolidate'),
    path = require('path'),
    routes = require('./routes'),
    mongo = require('mongodb').MongoClient,
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var url = 'mongodb://jerthiry:blog@proximus.modulusmongo.net:27017/Qewud2in';

mongo.connect(url, function(error, db) {
  if(!error) {

    var app = express();

    app.engine('html', engines.hogan);
    app.set('db', db);
    app.set('home', __dirname);
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'html'); // associer extension .html au moteur de templates
    app.set('views', path.join(__dirname, 'views'));

    // Middleware pour afficher les requêtes à la console.
    app.use(logger('dev'));

    // Middleware pour supporter les cookies.
    app.use(cookieParser());

    // Middleware pour gérer les requêtes POST.
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    routes(app);

    // var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
    // var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

    app.listen(process.env.PORT);
    }
  else {
    console.log(error);
  }
});
