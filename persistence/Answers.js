'use strict';
// TODO : check that this is not in use anymore and delete it
module.exports = function Answers(db) {

	var answers = db.collection("answers"),
	polls = require('./Polls');

	return {
    //ajout d'une réponse à une question
		addAnswer : function(permalink, question, answer, done) {
      var entry = {
        permalink: permalink,
        question: question-1,
        answer: answer,
        errors: {}
      };
      answers.insert(entry, function (error, result) {
        if (error) return done(error, null);
        return done(error, result);
      });
    },
    //récupérations de toutes les réponses d'un questionnaire
    getAnswers: function(permalink, done) {
      answers
        .find({'permalink': permalink})
        //.sort('date', -1)
        //.limit(count)
        .toArray(function(error, items) {
          if (error) return done(error, null);
          return done(error, items);
        });
    },
    //récupération des réponses sous forme de texte pour une question
    getTextAnswers: function(permalink, question, done) {
      answers
        .find({permalink : permalink, question: question}, {answer:true, _id: false})
        .toArray(function(error, items) {
          if (error) return done(error, null);
          return done(error, items, question);
        });
    },
    //compte le nombre de réponse pour une proposition d'une question
    countAnswers: function(permalink, question, j, answer, done) {
    	var k = question;
    	var l = j;
      answers
        .count({permalink: permalink, question: question, answer: answer}, function(error, count) {
        if (error) return done(error, null);
        return done(null, count, k, l);
      });

    },
    //compte le nombre de réponse pour une proposition de question
    countGlobalAnswers: function(permalink, question, done) {
      answers
        .count({permalink: permalink, question: question}, function(error, count) {
        if (error) return done(error, null);
        return done(null, count);
      });

    }
	};
};
