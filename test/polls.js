var async = require('async'),
chai = require('chai'),
expect = chai.expect;

module.exports = function (db) {

	var Sessions = require('../persistence/Sessions.js')(db);
	var Users = require('../persistence/Users.js')(db);
	var Polls = require('../persistence/Polls.js')(db);

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

	var tomorow = new Date();
	var dd = tomorow.getDate()+1;
	var mm = tomorow.getMonth()+1; //January is 0!
	var yyyy = tomorow.getFullYear();
	if(dd<10){
		dd='0'+dd
	} 
	if(mm<10){
		mm='0'+mm
	} 
	var tomorow = yyyy+'-'+mm+'-'+dd;

	describe('Poll', function () {
		it('add Poll', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;
					done();
				});
			});
		});
		it('get Polls', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;

					Polls.getPolls(function(error, items){
						expect(err).to.not.exist;
						expect(items.length).to.equal(1);
						done();
					});
				});
			});
		});
		it('get public Polls', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;

					Polls.getPublicPolls(function(error, items){
						expect(err).to.not.exist;
						expect(items.length).to.equal(1);
						done();
					});
				});
			});
		});
		it('get Polls by username', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;

					Polls.getPollsByUsername('fquindot',function(error, items){
						expect(err).to.not.exist;
						expect(items.length).to.equal(1);
						done();
					});
				});
			});
		});
		it('get poll by permalink', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;

					Polls.getPollByPermalink(permalink,function(error, poll){
						expect(err).to.not.exist;
						expect(poll['title']).to.equal('Questionnaire test');
						done();
					});
				});
			});
		});
		it('add Question to poll', function (done) {
			Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
				expect(err).to.not.exist;
				expect(user).to.exist;
				Polls.addPoll("Questionnaire test","","description",today,tomorow,false,user,0, function(err, permalink){
					expect(err).to.not.exist;
					expect(permalink).to.exist;

					Polls.addQuestion(permalink,'Question ?',function (err, questionNum) {
						expect(err).to.not.exist;
						expect(questionNum).to.exist;
						expect(questionNum).to.equal(1);
						done();
					});
				});
			});
		});
	});
}