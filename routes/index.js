//This file handles routes, ie what to do according to the current URL


'use strict';

var express = require('express'),
    path = require('path');

module.exports = exports = function(app) {

  var handlers = {
    session: require('./session')(app),
    content: require('./content')(app),
    error: require('./error'),
    profile: require('./profile')(app)
  };

  app.use(handlers.session.authentication.check);

  //Index
  app.get('/', handlers.content.home);

  //Signup page
  app.get ('/signup', handlers.session.signup.input);
  app.post('/signup', handlers.session.signup.validate);
  app.post('/signup', handlers.session.signup.perform);

  //Login and logout page
  app.get ('/login', handlers.session.login.input);
  app.post('/login', handlers.session.login.validate);
  app.post('/login', handlers.session.login.perform);
  app.get ('/logout', handlers.session.logout.perform);

  //Results of a survey
  app.get ('/polls/:permalink/results', handlers.content.results.getAnswers);

  //Adding questions to a survey
  app.get ('/polls/:permalink/newquestion', handlers.content.question.new);
  app.post ('/polls/:permalink/newquestion', handlers.content.question.validate);
  app.post ('/polls/:permalink/newquestion', handlers.content.question.add);

  //Fill survey
  app.get ('/polls/:permalink/:question', handlers.content.answerFill.input);
  app.post ('/polls/:permalink/:question', handlers.content.answerFill.validate);
  app.post ('/polls/:permalink/:question', handlers.content.answerFill.perform);

  //Personnal polls
  app.get ('/mypolls', handlers.content.polls.byUsername);

  //Creating a new survey
  app.get ('/polls', handlers.content.polls.input);
  app.post('/polls', handlers.content.polls.validate);
  app.post('/polls', handlers.content.polls.add);

  //Main page for a survey
  app.get ('/polls/:permalink', handlers.content.polls.byPermalink);

  //User profile
  app.get('/profile', handlers.profile.get.profile);
  app.post('/profile', handlers.profile.set.validate);
  app.post('/profile', handlers.profile.set.perform);

  //404
  app.get('/404', handlers.content.error.notfound);


  app.use(express.static(app.get("views")));

  app.use(handlers.error);

  //Else, 404 page
  app.get('*', function(res, req) {
    req.redirect('/404');
  });
};
