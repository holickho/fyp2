var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TRANSTEXT = new Schema({
    inputText: {type: String},
    outputText: {type: String},
    datetime: {type: Date},
    by: {type: String}
});

//module.exports = { TRANSTEXT };
module.exports = mongoose.models.Translate || mongoose.model('Translate', TRANSTEXT);