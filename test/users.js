var async = require('async'),
    chai = require('chai'),
    expect = chai.expect;

module.exports = function (db) {

  var Users = require('../persistence/Users.js')(db);

  function createUsers(done) {
    async.series([
        function (cb) {
          Users.addUser('vremy', 'password','test1@gmail.com', 'Vermeiren', 'Rémy', cb);
        },
        function (cb) {
          Users.addUser('tjerome', 'password','test2@gmail.com', 'Thiry', 'Jérôme', cb);
        },
        function (cb) {
          Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', cb);
        }
      ], done)
  }
  describe('User', function () {
    it('accepts new users', function (done) {
      createUsers(done);
    });
    it('Can be created', function (done) {
        Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {
          expect(err).to.not.exist;  
          if (err) return done(err);
          done();
        });
    });
    it('User can be get', function (done) {
        Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
          expect(err).to.not.exist;
        });
        Users.getUserData('fquindot', function(err, user){
          if (err) return done(err);
          expect(err).to.not.exist;
          expect(user).to.have.a.property('_id');
          expect(user).to.have.a.property('password');
          expect(user).to.have.a.property('email');
          expect(user).to.have.a.property('lastname');
          expect(user).to.have.a.property('firstname');
          expect(user['firstname']).to.equal('Fanny');
          done();
        });
    });
    it('User can be update', function (done) {
      Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
        expect(err).to.not.exist;
      });
      Users.getUserData('fquindot', function(err, user){
        expect(err).to.not.exist;
        expect(user).to.have.a.property('_id');
        expect(user).to.have.a.property('password');
        expect(user).to.have.a.property('email');
        expect(user).to.have.a.property('lastname');
        expect(user).to.have.a.property('firstname');
        expect(user['firstname']).to.equal('Fanny');
      });
      Users.updateUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Léa', function (err, user) {
        expect(err).to.not.exist;
      
        Users.getUserData('fquindot', function(err, user){
          expect(err).to.not.exist;
          expect(user).to.have.a.property('_id');
          expect(user).to.have.a.property('password');
          expect(user).to.have.a.property('email');
          expect(user).to.have.a.property('lastname');
          expect(user).to.have.a.property('firstname');
          expect(user['firstname']).to.equal('Léa');
          done();
        });
      });
    });
    it('Can be authenticated', function (done) {
        Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
            if (err) return done(err);
            expect(err).to.not.exist;
            expect(user).to.have.a.property('password');
            Users.validateLogin('fquindot','password', function (err, result) {
                if (err) return done(err);
                expect(result).not.to.be.null;
                done();
            });
        });
    });
    it('Cannot be authenticated if lacking a password', function (done) {
      Users.addUser('fquindot', 'password','test3@gmail.com', 'Quindot', 'Fanny', function (err, user) {  
            if (err) return done(err);
            expect(err).to.not.exist;
            expect(user).to.have.a.property('password');
            Users.validateLogin('fquindot','passwordlol', function (err, result) {
                expect(err).to.exist;
                expect(result).to.not.exist;
                done();
            });
        });
    });
  });
}
