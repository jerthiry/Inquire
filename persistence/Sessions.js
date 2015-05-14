"use strict";

var assert = require('assert'),
crypto = require('crypto'),
UnknownSessionError = require('./errors/UnknownSession'),
users = require('./Users');

module.exports = function Sessions(db) {

    var sessions = db.collection("sessions");


    return {
        startSession: function(username, done) {

                var date = (new Date()).valueOf().toString();
                var random = Math.random().toString();
                var sessionId = crypto.createHash('sha1').update(date + random).digest('hex');;

                // Document de session pour la basse des données.
                var session = { '_id': sessionId};

                // Inserrer le document dans la DB.
                sessions.insert(session, function (error, result) {
                    return done(error, sessionId);
            });  
        },
        endSession: function(sessionId, done) {
            // Éliminer le document représentant la session.
            sessions.remove({ '_id' : sessionId }, function (error, count) {
                return done(error);
            });
        },
        getUsername: function(sessionId, done) {
            sessions.findOne({ '_id' : sessionId }, function(error, session) {
                if (error) return done(error, null);
                if (!session) return done(new UnknownSessionError(sessionId), null);
                return done(null, session.username);
            });
        }
    };
};
