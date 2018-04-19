
// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
// declare schema object.
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
created_on : {type : Date},
message    : {type : String, default : ''}

});

mongoose.model('Chat',ChatSchema);