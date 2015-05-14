"use strict";

var assert = require('assert'),
    InvalidPasswordError = require('./errors/InvalidPassword'),
    UnknownUserError = require('./errors/UnknownUser');

module.exports = function Users(db) {

    var users = db.collection("users");

    return {
        addUser: function(username, password, email,lastname, firstname, done) {
            // Normalement, on devrait encrypter le mot de passe à ce point-ci.
            var entry = {
                _id: username,
                password: password,
                email : email,
                lastname : lastname,
                firstname : firstname
            };
 
            users.insert(entry, function (error, result) {
                if (error) return done(error, null);
                return done(null, result[0]);
            });
        },
        updateUser: function(username, password, email,lastname, firstname, done) {
          users.findOne({'_id': username}, function(error, user) {
            if (error) return done(error, null);
            user['firstname']=firstname;
            user['lastname']=lastname;
            user['password']=password;
            user['email']=email;

            users.update({'_id': username}, user, function (error, result) {
              if (error) return done(error, null);

              return done(null, result[0]);
            });
          });
        },
        validateLogin: function(username, password, done) {
            users.findOne({ '_id' : username }, function(error, user) {
                if (error) return done(error, null);
                if (!user) return done(new UnknownUserError(username), null);
                if (user.password !== password)
                    return done(new InvalidPasswordError(username), null);
                return done(null, user); // réussi
            });
        },
        getUserData: function(username, done) {
          users.findOne({'_id': username}, function(error, user) {
            if (error) return done(error, null);
            return done(error, user);
            });
        }
    };
}