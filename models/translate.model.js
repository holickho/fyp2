var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TRANSTEXT = new Schema({
    inputText: String,
    preText: String,
    tagging: String,
    outputText: String,
    datetime: Date,
    by: String,
    langType: String,
    transType: String
});

var TransText = mongoose.model('transtext', TRANSTEXT);

//module.exports = { TRANSTEXT };
module.exports = TransText;