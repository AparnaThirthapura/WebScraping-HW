var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  noteTitle:{
    type:String,
    trim:true
  },
  noteBody:{
    type:String,
    trim:true
  }
});

var Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
