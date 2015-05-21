var async = require('async'),
    chai = require('chai'),
    expect = chai.expect;

module.exports = function (db) {

  var Sessions = require('../persistence/Sessions.js')(db);
  var Users = require('../persistence/Users.js')(db);


  describe('Session', function () {
  	it('log in Session', function (done) {
      Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
          expect(err).to.not.exist;
        });
      Sessions.startSession('fquindot', function(err, result){
      	expect(err).to.not.exist;
      	expect(result).to.exist;
      	done();
      });

    });
    it('log out Session', function (done) {
      Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
          expect(err).to.not.exist;
        });
      Sessions.startSession('fquindot', function(err, result){
        expect(err).to.not.exist;
        expect(result).to.exist;

        Sessions.endSession(result, function(err, result){
          expect(err).to.not.exist;
          done();
        });
      });  
    });
  });
}