'use strict';

module.exports = function Answers(db) {

	var answers = db.collection("answers"),
	polls = require('./Polls');

	return {
		addAnswer : function(permalink, question, answer, done) {
      var entry = {
        permalink: permalink,
        question: question-1,
        answer: answer,
        errors: {}
      };
      console.log(entry);
      answers.insert(entry, function (error, result) {
        if (error) return done(error, null);
        return done(error, result[0]);
      });
    },
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
    getTextAnswers: function(permalink, question, done) {

      answers
        .find({permalink : permalink, question: question}, {answer:true, _id: false})
        .toArray(function(error, items) {
          if (error) return done(error, null);
          console.log(items);
          return done(error, items, question);
        });
    },
    countAnswers: function(permalink, question, j, answer, done) {
    	var k = question;
    	var l = j;
      answers
        .count({permalink: permalink, question: question, answer: answer}, function(error, count) {
        if (error) return done(error, null);
        return done(null, count, k, l);
      });

    },
    countGlobalAnswers: function(permalink, question, done) {
      answers
        .count({permalink: permalink, question: question}, function(error, count) {
        if (error) return done(error, null);
        return done(null, count);
      });

    }
	};
};