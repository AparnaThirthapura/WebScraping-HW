// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

var request = require("request");
var cheerio = require("cheerio");

var Note = require("./models/note.js");
var Article = require("./models/article.js");


// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
var dbURI = "mongodb://localhost/WebScrapeDB";
if(process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(dbURI);
}

var db = mongoose.connection;
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//set handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//setup the routes

app.get("/", function(req, res){
  res.render("home");
});

app.get("/scrape", function(req, res) {
  console.log("starting scrapping html");
  request("http://www.technewsworld.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    console.log("Loading html");
    $("a").each(function(i, element) {
      // console.log(element);
      console.log(i);

      var resultArticle = {};


        resultArticle.articleTitle = $(this).text();
        resultArticle.articleLink = $(element).attr("href");

      var newArticle = new Article(resultArticle);
      var query = newArticle.save();
      query.exec(function(err, doc){
        if(err)
          console.log(err);
        else
          console.log(doc);
      });
    });
  });
  res.render("home", {Article:docs});
});

app.get("/articles", function(req, res) {
  var query = Article.find({}).limit(10);
  query.exec(function(err, docs){
    if(err)
      console.log(err);
    else
      res.render("home", {Article:docs});
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      res.json({Article:doc});
    }
  });
});

app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);

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
          res.send(doc);
        }
      });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
