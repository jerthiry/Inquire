'use strict';

module.exports = function Polls(db) {

  var polls = db.collection("polls"),
  crypto = require('crypto');

  return {
    //ajout d'un questionnaire
    addPoll: function(title, subtitle, description, startingdate, closingdate, privacy, author, questnumber, done) {
      // var permalink = title.replace( /\s/g, '_' );
      // permalink = permalink.replace( /\W/g, '' );
      var random = Math.random().toString(),
      date = new Date(),
      permalink = crypto.createHash('sha1').update(date + random).digest('hex');
      var entry = {
        title: title,
        subtitle: subtitle,
        description: description,
        startingdate: startingdate,
        closingdate: closingdate,
        privacy: privacy,
        author: author._id,
        authorfirst: author.firstname,
        authorlast: author.lastname,
        permalink: permalink,
        questnumber: questnumber,
        errors: {}
      };
      polls.insert(entry, function (error, result) {
        if (error) return done(error, null);
        return done(error, permalink);
      });
    },
    //récupération de tous les questionnaires
    getPolls: function(done) {
      polls
      .find()
      .sort('date', -1)
        //.limit(count)
        .toArray(function(error, items) {
          if (error) return done(error, null);
          return done(error, items);
        });
      },
      //récupération de tous les questionnaires publique
      getPublicPolls: function(done) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){
          dd='0'+dd
        }
        if(mm<10){
          mm='0'+mm
        }
        var today = yyyy+'-'+mm+'-'+dd;
        polls
        .find({privacy: false, closingdate: {$gte: today}})
        .sort('startingdate', -1)
        //.limit(count)
        .toArray(function(error, items) {
          if (error) return done(error, null);
          return done(error, items);
        });
      },
      //récupération des questionnaires lié à un utilisateur
      getPollsByUsername: function(username, done) {
        polls
        .find({ author : username})
        .sort('startingdate', -1)
        .toArray(function(error, items) {
          if (error) return done(error, null);
          return done(error, items);
        });
      },
      //récupération d'un questionnaire par son permalink
      getPollByPermalink: function(permalink, done) {
        polls.findOne({'permalink': permalink}, function(error, poll) {
          if (error) return done(error, null);
          console.log(poll);
          return done(error, poll);
        });
      },
      //ajout d'un question
      addQuestion: function(permalink, question, done) {
        this.getPollByPermalink(permalink, function(error, poll) {

          if(!poll.question){
            var tab = [];
            poll.question = tab;
          }
          poll.questnumber = poll.questnumber+1;
          question.number = poll.questnumber;
          poll.question[poll.question.length]=question;

          polls.update({permalink: permalink}, poll, function(error, count) {
            if (error) return done(error, null);
            return done(error, count);
          });
        });
      }
    };
  };
