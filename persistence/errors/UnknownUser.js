'use strict';

// Fonction constructeur de l'erreur.
var UnknownUserError = function(username) {
    // Appeler le constructeur parent.
    Error.call(this);
    // Initialiser le message correspondant à cette erreur.
    this.message = "Unknown user " + username;
};

// Établir l'héritage UnknownUserError -> Error.
UnknownUserError.prototype = new Error();

// Corriger l'attribut 'constructor', car il pointe vers Error.
UnknownUserError.constructor = UnknownUserError;

module.exports = UnknownUserError;
