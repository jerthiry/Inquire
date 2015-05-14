"use strict";

module.exports = exports = function(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    res.render('error', { error: err });
}
