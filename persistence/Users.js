
var assert = require('assert'),
    crypto = require('crypto'),
    InvalidPasswordError = require('./errors/InvalidPassword'),
    UnknownUserError = require('./errors/UnknownUser');

module.exports = function Users(db) {
    //connection à la base de données
    var users = db.collection("users");

    return {
        //ajout d'un utilisateur
        addUser: function(username, password, email,lastname, firstname, done) {
            // Normalement, on devrait encrypter le mot de passe à ce point-ci.
            password=crypto.createHash('sha1').update(password).digest('hex');
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
        //mise à jour d'un utilisateur
        updateUser: function(username, password, email,lastname, firstname, done) {
            password=crypto.createHash('sha1').update(password).digest('hex');
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
        //validation d'un login pour authentification
        validateLogin: function(username, password, done) {
            password=crypto.createHash('sha1').update(password).digest('hex');
            users.findOne({ '_id' : username }, function(error, user) {
                if (error) return done(error, null);
                if (!user) return done(new UnknownUserError(username), null);
                if (user.password !== password)
                    return done(new InvalidPasswordError(username), null);
                return done(null, user); // réussi
            });
        },
        //récupération des données d'un utilisateur par son nom d'utilisateur
        getUserData: function(username, done) {
          users.findOne({'_id': username}, function(error, user) {
            if (error) return done(error, null);
            return done(error, user);
            });
        }
    };
}