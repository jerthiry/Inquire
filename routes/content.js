"use strict";

var Polls = require('../persistence/Polls');
var Users = require('../persistence/Users');
var Answers = require('../persistence/Answers');

module.exports = function(app) {

  var db = app.get("db"),
      polls = new Polls(db),
      users =  new Users(db),
      answers = new Answers(db);

  return {
    home: function (req, res, next) {
        polls.getPublicPolls(function(error, results) {
          if(error) return next(error);

        if (req.cookies.user)
        {
          users.getUserData(req.cookies.user.username, function(error, user) {
            if (error)
            {
              
              next(error);
            }
            else {
              return res.render('index', {
                session: req.cookies.session,
                user: req.cookies.user,
                polls: results
              });
            }
          });
        }
        else
        {
          res.render('index', {
          session: req.cookies.session,
          polls: results
          })
        }
 
      });
 
    },

    polls: {
      input: function (req, res, next) {
        if (!req.cookies.session) {return res.redirect("/login")}
        res.render('new-poll', {session: req.cookies.session, user: req.cookies.user});
      },
      validate: function (req, res, next) {
        var title = req.body.title,
            subtitle = req.body.subtitle,
            description = req.body.description,
            startingdate = req.body.startingdate,
            closingdate = req.body.closingdate,
            privacy = req.body.privacy,
            titleRE=/^.{3,60}$/,
            subtitleRE=/^.{0,60}$/,
            descriptionRE=/^.{0,400}$/,
            answer = {
              session: req.cookies.session,
              title: title,
              subtitle: subtitle,
              description: description,
              startingdate: startingdate,
              closingdate: closingdate,
              privacy: privacy,
              user : req.cookies.user,
              errors: {}
            },
            errors = answer.errors;

        if (!title || !titleRE.test(title))
          errors.title = "The poll must contain a title between 3-60 characters";

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
        if (!startingdate || startingdate<today)
          errors.startingdate = "The starting date must be posterior to today.";
        if (closingdate && closingdate<=startingdate)
          errors.closingdate = "The poll has to last at least one day.";
        if(!subtitleRE.test(subtitle))
          errors.subtitle = "The subtitle is limited to 60 characters";
        if(!descriptionRE.test(description))
          errors.description = "The description is limited to 400 characters.";


        if(Object.keys(errors).length === 0)
          next();
        else
          res.render("new-poll", answer); // afficher erreurs
      },
      add: function (req, res, next) {

        if (!req.cookies.session) return res.redirect("/signup");
        var title = req.body.title,
            subtitle = req.body.subtitle,
            description = req.body.description,
            startingdate = req.body.startingdate,
            closingdate = req.body.closingdate,
            privacy = false,
            questnumber = 0;
            if (req.body.privacy == 'true') {
              privacy = true;
            }

        var   answer = {
              session: req.cookies.session,
              title: title,
              subtitle: subtitle,
              description: description,
              startingdate: startingdate,
              closingdate: closingdate,
              privacy: privacy,
              questnumber: questnumber,
              errors: {}
            },
            errors = answer.errors;
        polls.addPoll(title, subtitle, description, startingdate, closingdate, privacy, req.cookies.user, questnumber, function(error, permalink) {
          if (error) next(error);
          res.redirect("/polls/" + permalink +"/newquestion");
        });
      },
      byPermalink: function (req, res, next) {
        var permalink = req.params.permalink;
        polls.getPollByPermalink(permalink, function(error, poll) {
          if (error)  {
            next(error); 
          }
          else {
            if (!poll)
              return res.redirect('/../404');
            var owner = false;
            if(req.cookies.user) {
              if(req.cookies.user._id==poll.author)
              owner=true;
              }
            
            return res.render('polls', {
              session: req.cookies.session,
              user: req.cookies.user,
              poll: poll,
              owner: owner
            });
          }
        });
      },
      byTag: function (req, res) {
        var tag = req.params.tag;
        polls.getPollsByTag(tag, function (error, polls) {
          if (error)
            next(error);
          else
            res.render('polls-by-tag', {
              session: req.cookies.session,
              tag: req.params.tag,
              polls: polls
            });
        });
      },
      byUsername: function (req, res, next) {
        if (req.cookies.user)
        {
          polls.getPollsByUsername(req.cookies.user._id, function(error, results) {
            if (error)
            {
              next(error);
            }
            else {
              return res.render('mypolls', {
                session: req.cookies.session,
                user: req.cookies.user,
                polls: results
              });
            }
          });
        }
        else
        {
          res.redirect('login');
        }
    }
  },
    answerFill : {
      validate: function (req, res, next) {
        var permalink = req.params.permalink;
        var question = req.params.question-1;
        polls.getPollByPermalink(permalink, function(error, poll) {
          if (error)
            next(error);
          else {
            var textfieldRE=/^.{0,400}$/,
                answer = {
                  session: req.cookies.session,
                  user : req.cookies.user,
                  ans : req.body.answer,
                  poll : poll,
                  question: poll.question[question],
                  errors: {}
                },
                errors = answer.errors;
                console.log(answer.ans);
            if (poll.question[question].type == 'textarea')
            {
              if(!textfieldRE.test(answer.ans))
              errors.ans = "The text is limited to 400 characters.";
            }
            else if (poll.question[question].type == 'radio')
            {
              if(answer.ans === undefined)
                errors.ans = "One proposition must be choose";
            }
            else
            {
              if(answer.ans === undefined)
                errors.ans = "One or more proposition must be choose";
            }

            if(Object.keys(errors).length === 0)
              next();
            else
              res.render("question", answer); // afficher erreurs
          }
        });
      },
      input:  function (req, res, next) {
        var permalink = req.params.permalink;
        var question = req.params.question-1;
        polls.getPollByPermalink(permalink, function(error, poll) {
          if (error)
            next(error);
          else {
            if (!poll)
              res.status(400).send("Not found");
            if(!poll.question[question])
              return res.redirect('/');
            var title ;
            return res.render('question', {
              session: req.cookies.session,
              user: req.cookies.user,
              poll: poll,
              question: poll.question[question]
            });
          }
        });
      },
      perform: function (req, res, next) {
        var permalink = req.params.permalink,
        question = req.params.question;
        polls.getPollByPermalink(permalink, function(error, poll) {
          var answer = req.body.answer;
          answers.addAnswer(permalink, question, answer, function(error, answer) {
            if (error)
              next(error);
            else{
              question++;
              res.redirect('/polls/'+permalink+'/'+question);
            }
          });



        });
      }
    },





    question : {
      new: function (req, res, next) {
        var permalink = req.params.permalink;
        polls.getPollByPermalink(permalink, function(error, poll) {
          if (error)
            next(error);
          else{
            console.log("lol");
            if(req.cookies.user._id == poll.author) {
              res.render('new-question', {
                session: req.cookies.session,
                user: req.cookies.user,
                poll: poll
              });
            }
            else {
              res.redirect("/");
            }

          }


        });
      },
      add: function(req, res, next) {
        if (!req.cookies.session) return res.redirect("/signup");

        var permalink = req.params.permalink,
            questionlabel = req.body.questionlabel,
            precision = req.body.precision,
            type = req.body.answertype,
            props,
            cleanprops = [];
        if (type=='radio' || type=='checkbox')
        {
          var rawprop=req.body.choices;
          props = rawprop.split(/[\r\n]+/);
          var cnt = 0;
          for(var i=0; i<props.length; i++) {
            props[i] = props[i].trim();
            if(props[i]!='') {
              cleanprops[cnt]=props[i];
              cnt++;
            }
          }
        }
        var   question = {
              label: questionlabel,
              precision: precision,
              type: type,
              props: cleanprops,
              isCheck: false,
              isRadio: false,
              isText: false,
              number: 0
            };

        if(question.type == 'textarea') {
          question.isText = true;
        }
        else if(question.type == 'radio') {
          question.isRadio = true;
        }
        else if(question.type == 'checkbox') {
          question.isCheck = true;
        }
        polls.addQuestion(permalink, question, function(error, permalink2) {

          permalink2=permalink;
          //if (error) next(error);

          res.redirect("/polls/" + permalink2 +"/newquestion");
        });
      },
      validate: function (req, res, next) {
        var permalink = req.params.permalink;
        polls.getPollByPermalink(permalink, function(error, poll) {
        if(req.body.answertype!='textarea') {
          var rawprop=req.body.choices;
          var cleanprops = [];
          var props = rawprop.split(/[\r\n]+/);
          var cnt = 0;
          for(var i=0; i<props.length; i++) {
            props[i] = props[i].trim();
            if(props[i]!='') {
              cleanprops[cnt]=props[i];
              cnt++;
            }
          }
        }
        else {
          var props = null;
        }
        var labelRE=/^.{3,160}$/,
        answer = {
          session: req.cookies.session,
          label : req.body.questionlabel,
          precision : req.body.precision,
          type : req.body.answertype,
          props : props,
          poll: poll,
          errors: {}
        },
        errors = answer.errors;
        if(req.cookies.user)
          answer.user=req.cookies.user;


        if (!labelRE.test(answer.label))
          errors.questionlabel = "The question has to contain between 3 and 160 characters";

        if(answer.type!='textarea') {
          if(answer.props.length < 2) {
            errors.proposition = "Minimum 2 propositions.";
          }
        }

        if(Object.keys(errors).length === 0)
          next();
        else
          res.render("new-question", answer); // afficher erreurs
      });
    }
    },




// .----------------.  .----------------.     .----------------.  .----------------. 
// | .--------------. || .--------------. |   | .--------------. || .--------------. |
// | |  _________   | || |     ____     | |   | |  ________    | || |     ____     | |
// | | |  _   _  |  | || |   .'    `.   | |   | | |_   ___ `.  | || |   .'    `.   | |
// | | |_/ | | \_|  | || |  /  .--.  \  | |   | |   | |   `. \ | || |  /  .--.  \  | |
// | |     | |      | || |  | |    | |  | |   | |   | |    | | | || |  | |    | |  | |
// | |    _| |_     | || |  \  `--'  /  | |   | |  _| |___.' / | || |  \  `--'  /  | |
// | |   |_____|    | || |   `.____.'   | |   | | |________.'  | || |   `.____.'   | |
// | |              | || |              | |   | |              | || |              | |
// | '--------------' || '--------------' |   | '--------------' || '--------------' |
//  '----------------'  '----------------'     '----------------'  '----------------'
// // ON A FAIT DE LA MERDE AVEC Answers.js :/






    results : {

      getAnswers: function (req, res, next) {
        var permalink = req.params.permalink;
        var glob;
        answers.countGlobalAnswers(permalink, 0,function(error, count){
          if (error) {
            next(error);
          }
          else {
          glob=count;
          }
        });
        polls.getPollByPermalink(permalink, function(error, poll) {
          if (error)
            next(error);
          else {
            var results = [];
            for(var i=0; i<poll.questnumber; i++){
              console.log(poll.questnumber);
              poll.question[i].res=[];
              results[i] = [];

              //On doit itérer pour les qcm
              if(poll.question[i].isCheck || poll.question[i].isRadio){

                //Faire un tableau de la meme taille que props avec les nombre de fois que la réponse a été choisie
                for(var j=0; j<poll.question[i].props.length; j++)
                {
                  answers.countAnswers(permalink, i, j, poll.question[i].props[j], function(error, count, k, l){ 
                   
                    if(error) {
                    }
                    else {
                      results[k][l]=count;
                      poll.question[k].res=results[k];
                    }
                  });
                }
              }

              //On reprend juste un tableau de réponses si c'est une question ouverte
              else {
                answers.getTextAnswers(permalink, i, function(error, textanswers, k) {
                  if(error) {}
                  else {

                    //console.log("I : " +i);
                   
                    poll.question[k].res=textanswers;
                  }
                });
              }
            }

            return res.render('results', {
              session: req.cookies.session,
              user: req.cookies.user,
              poll: poll,
              glob: glob
            });
          }
        });
      }
    },
    error : {
      notfound : function (req, res, next) {
        if (!req.cookies.session) {return res.render("notfound")}
        res.render('notfound', {session: req.cookies.session, user: req.cookies.user});
      },
    }
  };
}