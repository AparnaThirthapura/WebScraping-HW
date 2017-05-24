var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  articleTitle:{
    type:String,
    trim:true,
    unique:true,
    required:"Article is required"
  },
  articleLink:{
    type:String,
    trim:true,
    unique:true,
    required:"Link is required"
  },
  articleSaved:{
    type:Boolean,
    default:false
  },
  note:{
    type:Schema.Types.ObjectId,
    ref:"Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
