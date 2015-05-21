var mongo = require('mongodb').MongoClient;

describe('Database', function () {

  it('is available', function (done) {

    var url = 'mongodb://localhost/blog-tests'; // not the same as in production!

    mongo.connect(url, function(error, db) {
      if (error) return done(error);

      beforeEach(function (done) {
        // Cleanup database before each unit test.
        db.dropDatabase(done);
      });

      // Module tests.
      require('./users')(db);
      require('./sessions')(db);

      // Finished database-related tests.
      done();
    });
  });
});
