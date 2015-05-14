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

  app.get('/', handlers.content.home);


  app.get ('/signup', handlers.session.signup.input);
  app.post('/signup', handlers.session.signup.validate);
  app.post('/signup', handlers.session.signup.perform);

  app.get ('/login', handlers.session.login.input);
  app.post('/login', handlers.session.login.validate);
  app.post('/login', handlers.session.login.perform);

  app.get ('/logout', handlers.session.logout.perform);
  
  app.get ('/polls/:permalink/results', handlers.content.results.getAnswers);
  
  app.get ('/polls/:permalink/newquestion', handlers.content.question.new);
  app.post ('/polls/:permalink/newquestion', handlers.content.question.validate);
  app.post ('/polls/:permalink/newquestion', handlers.content.question.add);
    //Fill survey
  app.get ('/polls/:permalink/:question', handlers.content.answerFill.input);
  app.post ('/polls/:permalink/:question', handlers.content.answerFill.validate);
  app.post ('/polls/:permalink/:question', handlers.content.answerFill.perform);


  app.get ('/mypolls', handlers.content.polls.byUsername);


  app.get ('/polls', handlers.content.polls.input);
  app.post('/polls', handlers.content.polls.validate);
  app.post('/polls', handlers.content.polls.add);

  app.get ('/polls/:permalink', handlers.content.polls.byPermalink);
 
  app.get ('/polls/tag/:tag', handlers.content.polls.byTag);



  app.get('/profile', handlers.profile.get.profile);
  app.post('/profile', handlers.profile.set.validate);
  app.post('/profile', handlers.profile.set.perform);

  app.get('/404', handlers.content.error.notfound);


  app.use(express.static(app.get("views")));

  app.use(handlers.error);

  app.get('*', function(res, req) {
    req.redirect('/404');
  });
};
