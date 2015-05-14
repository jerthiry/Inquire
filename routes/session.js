"use strict";

var Users = require('../persistence/Users'),
    Sessions = require('../persistence/Sessions'),
    InvalidPasswordError = require('../persistence/errors/InvalidPassword'),
    UnknownUserError = require('../persistence/errors/UnknownUser');

module.exports = function(app) {

  var db = app.get("db"),
      users = new Users(db),
      sessions = new Sessions(db);

  return {
    authentication: {
      check: function(req, res, next) {
        var sessionId = req.cookies.session;
        sessions.getUsername(sessionId, function(error, username) {
          if (!error && username) req.username = username;
          next();
        });
      }
    },
    login: {
      input: function(req, res, next) {
        res.render("login");
      },
      validate:  function(req, res, next) {
        next();
      },
      perform: function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        users.validateLogin(username, password, function(error, user) {
          if (!error) {
            sessions.startSession(user['_id'], function(error, sessionId) {
              if (!error) {
                res.cookie('session', sessionId);
                res.cookie('user', user);
                res.redirect('/');
              }
              else
                next(error);
            });
          }
          else {
            var answer = { username: username, errors: {} };
            if (error instanceof UnknownUserError) {
              answer.errors.username = error;
              res.render("login", answer);
            }
            else if (error instanceof InvalidPasswordError) {
              answer.errors.password = error;
              res.render("login", answer);
            }
            else {
              next(error); // passer erreur au gestionnaire suivant
            }
          }
        });
      }
    },
    logout: {
      perform: function(req, res, next) {
        var sessionId = req.cookies.session;
        sessions.endSession(sessionId, function (error) {
          res.cookie('session', '');
          res.cookie('user', '');
          res.redirect('/');
        });
      }
    },
    signup: {
      input: function(req, res, next) {
        res.render("signup");
      },
      validate: function(req, res, next) {
        var username = req.body.username,
            password = req.body.password,
            verify = req.body.verify,
            lastname =req.body.lastname,
            firstname=req.body.firstname,
            email = req.body.email,
            usernameRE = /^[a-zA-Z0-9_-]{3,20}$/,
            passwordRE = /^.{3,20}$/,
            nameRE=/^.{3,40}$/,
            emailRE = /^[\S]+@[\S]+\.[\S]+$/,
            answer = { username: username, email: email, password: password, lastname: lastname, firstname: firstname, errors: {} },
            errors = answer.errors;
        if (!usernameRE.test(username)) {
          errors.username = "Invalid username: must be alphanumeric and have between 3 and 20 characters";
        }
        if (!passwordRE.test(password)) {
          errors.password = "Invalid password: must have at least 3 and at most 20 caracters";
        }
        if (!nameRE.test(lastname)) {
          errors.lastname = "Invalid lastname: must have at least 3 and at most 40 caracters";
        }
        if (!nameRE.test(firstname)) {
          errors.firstname = "Invalid firstname: must have at least 3 and at most 40 caracters";
        }
        if (password != verify) {
          errors.verify = "Passwords must match";
        }
        if (email != "") {
          if (!emailRE.test(email)) {
            errors.email = "Invalid email address";
          }
        }
        if(Object.keys(errors).length === 0)
          // Validé : passer la requête au gestionnaire suivant.
          next();
        else
          // Échec : retourner à la page d'enregistrement.
          res.render("signup", answer);
      },
      perform: function(req, res, next) {
        var username = req.body.username,
            password = req.body.password,
            email = req.body.email,
            lastname=req.body.lastname,
            firstname=req.body.firstname,
            answer = { username: username, email: email,lastname: lastname, firstname: firstname,  errors: {} },
            errors = answer.errors;

        users.addUser(username, password, email, lastname, firstname, function(error, user) {
          if (error) {
            if (error.code == '11000') {
              errors.username = "Username already in use.";
              res.render("signup", answer);
            }
            else
              next(error); // faire appel au prochain gestionnaire
          }
          else {
            sessions.startSession(user['_id'], function(error, sessionId) {
              if (error)
                next(error);
              res.cookie('session', sessionId);
              res.cookie('user', user);
              res.redirect('/');
            });
          }
        });
      }
    }
  };
};
