"use strict";

var Users = require('../persistence/Users');

module.exports = function(app) {

	var db = app.get("db"),
	users = new Users(db);

	return {
		get: {
			input: function (req, res, next) {
				if (!req.cookies.user) return res.redirect("/profile")
					res.render('profile', { user: req.cookies.user });

			},
			profile: function (req, res, next) {

				if (req.cookies.user)
				{
					users.getUserData(req.cookies.user._id, function(error, user) {
						if (error)
							next(error);
						else {
							return res.render('profile', {
								session: req.cookies.session,
								username: req.cookies.user._id,
								tmpfirstname: req.cookies.user.firstname,
								tmplastname: req.cookies.user.lastname,
								firstname: req.cookies.user.firstname,
								lastname: req.cookies.user.lastname,
								email: req.cookies.user.email,
								password: req.cookies.user.password
							});
						}
					});
				}
				else
				{
					res.render('profile', {
						session: req.cookies.session,
						username: req.cookies.user
					})
				}

			}

		},
		set: {
			validate : function(req, res, next) {

				users.getUserData(req.cookies.user._id, function(error, user) {
					if (error)
						next(error);
					else {
						
						var username = req.body.username,
						password = req.body.password,
						verify = req.body.verify,
						lastname =req.body.lastname,
						firstname=req.body.firstname,
						email = req.body.email,
						usernameRE = /^[a-zA-Z0-9_-]{3,20}$/,
						passwordRE = /^.{3,20}$/,
						nameRE=/^.{3,40}$/,
						emailRE = /^[\S]+@[\S]+\.[\S]+$/,
						answer = { username: username, email: email, password: password, tmplastname: lastname, tmpfirstname: firstname, firstname: user.firstname, lastname: user.lastname, errors: {} },
						errors = answer.errors;
						if (!usernameRE.test(username)) {
							errors.username = "Invalid username: must be alphanumeric and have between 3 and 20 characters";
						}
						if (!passwordRE.test(password)) {
							errors.password = "Invalid password: must have at least 3 and at most 20 caracters";
						}
						if (!nameRE.test(lastname)) {
							errors.lastname = "Invalid lastname: must have at least 3 and at most 40 caracters";
						}
						if (!nameRE.test(firstname)) {
							errors.firstname = "Invalid firstname: must have at least 3 and at most 40 caracters";
						}
						if (password != verify) {
							errors.verify = "Passwords must match";
						}
						if (email != "") {
							if (!emailRE.test(email)) {
								errors.email = "Invalid email address";
							}
						}
						if(Object.keys(errors).length === 0){
		          // Validé : passer la requête au gestionnaire suivant.
		          next();
		        }
		        else {
		        	answer.session=req.cookies.session;
		        	res.render('profile', answer);

		        }

		      }
		    });
			},
			perform: function(req, res, next) {
				var username = req.body.username,
				password = req.body.password,
				email = req.body.email,
				lastname=req.body.lastname,
				firstname=req.body.firstname,
				answer = { username: username, email: email,lastname: lastname, firstname: firstname,  errors: {} },
				errors = answer.errors;

				users.updateUser(username, password, email, lastname, firstname, function(error, user) {
					if (error) {
						if (error.code == '11000') {
							errors.username = "Username already in use.";
							res.render("profile", answer);
						}
						else {
							next(error); 
						}
					}
					else {
						users.getUserData(username, function(error, user) {


							res.cookie('session', req.cookies.session);
							res.cookie('user', user);
							res.redirect('/');
						});
					}

				});
			}


		}
	}
}

