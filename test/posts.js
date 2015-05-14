var async = require('async'),
    chai = require('chai'),
    expect = chai.expect;

module.exports = function (db) {

  var Posts = require('../persistence/Posts.js')(db);

  function createPosts(done) {
    async.series([
        function (cb) {
          Posts.addPost('titleA', 'contentA', ['tag1','tag2'], 'authorA', cb);
        },
        function (cb) {
          Posts.addPost('titleB', 'contentA', ['tag1','tag2'], 'authorB', cb);
        },
        function (cb) {
          Posts.addPost('titleC', 'contentC', ['tag2','tag3'], 'authorC', cb);
        }
      ], done)
  }

  describe('Posts', function () {
    it('accepts new posts', function (done) {
      createPosts(done);
    });
    it('retrieves posts by tag', function (done) {
      // The database is cleaned up for each unit test, so we need to add the
      // posts that will be used it this test.
      createPosts(function (error) {
        Posts.getPostsByTag('tag1', function (error, posts) {
          expect(error).to.not.exist;
          expect(posts).to.have.length(2);
        });
        Posts.getPostsByTag('tag2', function (error, posts) {
          expect(error).to.not.exist;
          expect(posts).to.have.length(3);
        });
        Posts.getPostsByTag('tag3', function (error, posts) {
          expect(error).to.not.exist;
          expect(posts).to.have.length(1);
        })
        done();
      });
    });
  });

}
