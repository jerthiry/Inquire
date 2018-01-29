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
        anscount: 0,
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
      //récupération de tous les questionnaires publics
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
          // Update the question count
          poll.questnumber = poll.questnumber+1;
          question.number = poll.questnumber;

          // Array containing the answers
          question.answers = [];
          // Dictionary containing the number of time the proposition was selectionned
          if (question.isRadio || question.isCheck) {
            var ansCount = {};
            for(var i=0; i<question.props.length; i++) {
              ansCount[question.props[i]] = 0;
            }
            question.ansCount = ansCount;
          }

          // Add the question
          poll.question[poll.question.length] = question;

          polls.update({permalink: permalink}, poll, function(error, count) {
            if (error) return done(error, null);
            return done(error, count);
          });
        });
      },
      /* ANSWERS */
      // Add an answer to a question
      addAnswer : function(permalink, question, answer, done) {
        this.getPollByPermalink(permalink, function(error, poll) {
          var k = question-1;
          // For one or multiple choice, also update count on answers for quick computations
          if (poll.question[k].isRadio || poll.question[k].isCheck) {
            poll.question[k].answers.push(Array(answer));
            if(Array.isArray(answer)) {
              for(var i=0; i<answer.length; i++) {
                poll.question[k].ansCount[answer[i]] += 1;
              }
            }
            else {
              poll.question[k].ansCount[answer] += 1;
            }
          }
          else {
            poll.question[k].answers.push(answer);
          }
          polls.update({permalink: permalink}, poll, function(error, count) {
            if (error) return done(error, null);
            return done(error, count);
          });
        });
      },
      // Get the answers to display them in results page
      getAnswers : function(permalink, done) {
        this.getPollByPermalink(permalink, function(error, poll) {
          var answers = [];
          for(var i=0; i<poll.questnumber; i++) {
            var questionanswers = [];
            if(poll.question[i].isCheck || poll.question[i].isRadio) {
              for(var j=0; j<poll.question[i].props.length; j++) {
                questionanswers.push(poll.question[i].ansCount[poll.question[i].props[j]]);
              }
              answers.push(questionanswers);
            }
            else {
              answers.push(poll.question[i].answers);
            }
          }
          return done(error, answers);
        });
      }
    };
  };
