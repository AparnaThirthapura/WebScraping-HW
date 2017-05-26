
var express = require("express");
var router = express.Router();

var mongoose = require("mongoose");
var Promise = require("bluebird");

var request = require("request");
var cheerio = require("cheerio");

var Note = require("../models/note.js");
var Article = require("../models/article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Database configuration with mongoose
var dbURI = "mongodb://localhost/WebScrapeDB";

mongoose.connect(dbURI);
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//setup the routes
router.get("/", function(req, res){
  res.render("home");
});

router.get("/scrape", function(req, res) {
  console.log("starting scrroutering html");

  request("http://www.pcmag.com/news", function(error, response, html) {
    var $ = cheerio.load(html);

        $(".article-deck").each(function(i, element) {
              var result = {};
              result.articleLink = $(element).find("a").attr("href");
              result.articleTitle = $(element).find("a").text().trim();
              result.articleBody = $(element).find("p").text();

              console.log(result);

      var newArticle = new Article(result);
      newArticle.save(function(err, doc){
        if(err)
          console.log(err);
        else
          console.log(doc);
      });
    });
  });
  res.render("home", {title:"Scraping complete"});
});

router.get("/showAllArticles", function(req, res) {
  var query = Article.find({}).limit(10);
  query.exec(function(err, docs){
    if(err)
      console.log(err);
    else{
      console.log(docs);
      res.render("home", {AllArticles:docs});
    }
  });
});

router.get("/showSavedArticles", function(req, res){
  var query = Article.find({articleSaved:true}).limit(10).populate("note");
  query.exec(function(err, docs){
    if(err)
      console.log(err);
    else {
      console.log(docs);
      res.render("home", {SavedArticles:docs});
    }
  });
});

router.put("/articles/:id", function(req, res){
  Article.findByIdAndUpdate({ "_id": req.params.id}, {$set:{articleSaved:true}}, function(err, docs){
    if(err)
      console.log(err);
    else {
      res.render("home", {title:"Article Saved"});
    }
  });
});

router.delete("/articles/:id", function(req, res){
  Article.findByIdAndRemove({ "_id": req.params.id},function(err, docs){
    if(err)
      console.log(err);
    else {
      res.render("home", {title:"Article Deleted"});
    }
  });
});

router.put("/savedArticles/:id", function(req, res){
  Article.findByIdAndUpdate({ "_id": req.params.id}, {$set:{articleSaved:false}}, function(err, docs){
    if(err)
      console.log(err);
    else {
      res.render("home", {title:"Article Deleted from Saved"});
    }
  });
});


router.get("/viewNote/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      console.log("viewNote found....")
      console.log(doc);
      res.render("home", doc);
    }
  });
});

router.post("/addNote/:id", function(req, res) {
  var newNote = new Note(req.body);

  console.log("******************");
  console.log("Adding note.......");
  console.log("ID: " + req.params.id);
  //console.log("Body: " + req.body);
  console.log("******************");


  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Note Added");
          res.render("home"); /*Put something in modal*/
        }
      });
    }
  });
});

router.delete("/deleteNote/:id", function(req, res) {
  Note.remove({ "_id": req.params.id }, function(err, removed){
    if(err)
      console.log(err);
    else {
      console.log("Note Removed");
    }
  });
});


module.exports = router;
