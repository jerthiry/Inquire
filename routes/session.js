
/**session.js
 * This file contains functions that are necessary to handle
 * user session actions, such as login, logout, signup
 */

var Users = require('../persistence/Users'),
    Sessions = require('../persistence/Sessions'),
    InvalidPasswordError = require('../persistence/errors/InvalidPassword'),
    UnknownUserError = require('../persistence/errors/UnknownUser');

module.exports = function(app) {
  var db = app.get("db"),
      users = new Users(db),
      sessions = new Sessions(db);
  console.log(typeof(db));
  return {
    //Useful for connection
    authentication: {
      check: function(req, res, next) {
        var sessionId = req.cookies.session;
        sessions.getUsername(sessionId, function(error, username) {
          if (!error && username) req.username = username;
          next();
        });
      }
    },

    //Login functions
    login: {

      //Renders the login page
      input: function(req, res, next) {
        res.render("login");
      },

      validate:  function(req, res, next) {
        next();
      },

      // Checks if login credentials are ok, and if so starts a session and updates the cookies
      perform: function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        users.validateLogin(username, password, function(error, user) {
          if (!error) {
            sessions.startSession(user['_id'], function(error, sessionId) {
              if (!error) {
                res.cookie('session', sessionId);
                delete user['password'];
                res.cookie('user', user);
                res.redirect('/');
              }
              else
                next(error);
            });
          }

          //If errors then prompts to reenter credentials
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

    //performs a logout, resets the cookies, redirects to main page
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

    //Signup functions
    signup: {
      //Renders the signup page
      input: function(req, res, next) {
        res.render("signup");
      },

      //Checks if everything is valid
      validate: function(req, res, next) {
        var username = req.body.username,
            password = req.body.password,
            verify = req.body.verify,
            lastname =req.body.lastname,
            firstname=req.body.firstname,
            email = req.body.email,
            //Alphanumeric, 3-20 characters
            usernameRE = /^[a-zA-Z0-9_-]{3,20}$/,
            //3-20 characters
            passwordRE = /^.{3,20}$/,
            //3-40 characters
            nameRE=/^.{3,40}$/,
            //email must be like xxxx@xxxx.xxxx
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
          // validated : passes to next function
          next();
        else
          // if there are errors, renders the signup page with fields already completed
          res.render("signup", answer);
      },

      // Inserts the user in the database.
      perform: function(req, res, next) {
        var username = req.body.username,
            password = req.body.password,
            email = req.body.email,
            lastname=req.body.lastname,
            firstname=req.body.firstname,
            answer = { username: username, email: email,lastname: lastname, firstname: firstname,  errors: {} },
            errors = answer.errors;

        //Calls the database insert function
        users.addUser(username, password, email, lastname, firstname, function(error, user) {
          if (error) {
            //Renders the signup page with fields already completed
            if (error.code == '11000') {
              errors.username = "Username already in use.";
              res.render("signup", answer);
            }
            else
              next(error); // next function
          }
          else {
            console.log(user);
            //Starts a session and updates the cookies
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
