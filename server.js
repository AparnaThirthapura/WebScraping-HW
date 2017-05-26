// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var logger = require("morgan");
var router = require("./routes/appRoutes.js");
var port = process.env.PORT || 3000;
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

app.use(methodOverride("_method"));

//set handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("/", router);

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port!" + port);
});
