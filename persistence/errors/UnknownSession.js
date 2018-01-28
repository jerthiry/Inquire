'use strict';

// Fonction constructeur de l'erreur.
var UnknownSessionError = function(sessionId) {
    // Appeler le constructeur parent.
    Error.call(this);
    // Initialiser le message correspondant à cette erreur.
    this.message = "Unknown session " + sessionId;
};

// Établir l'héritage UnknownSessionError -> Error.
UnknownSessionError.prototype = new Error();

// Corriger l'attribut 'constructor', car il pointe vers Error.
UnknownSessionError.constructor = UnknownSessionError;

module.exports = UnknownSessionError;
