'use strict'; // Added to not allow undefined variables

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


//Added Body Parser
const bodyParser = require('body-parser');

//support parsing of app/json type post data
app.use(bodyParser.json());

//support parsing of application
app.use(bodyParser.urlencoded({ extended: false }));

// Install & Set up mongoose
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI;
const isUrl = require("is-valid-http-url");

// Connect to Mongoose
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

// Displays connection errors
connection.on('error', console.error.bind(console, 'connection error:'));

// Create Schema
const Schema = mongoose.Schema;
var urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

// Create Model
const urlModel = mongoose.model("urlModel", urlSchema);

// Only executes if successfully connected
connection.once('open', function() {
  console.log("MongoDB connected successfully");
  // new API endpoint for post to save URL in database
  app.post("/api/shorturl", (req, res) => {
    const orginalUrl = req.body.url;

    // Check if posted URL is valid
    if (!isUrl(orginalUrl)) {
      res.json({ error: "invalid url" });
    } else {
      urlModel.estimatedDocumentCount((err, cnt) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Attempting to save URL");
          var url = new urlModel({
            original_url: orginalUrl,
            short_url: cnt + 1
          });
          
          /* If there is an error saving
          then log it to the console. */
          url.save((err) => {
            if (err) {
              console.log(err);
            }
          });
          
          // Otherwise save the URL
          console.log("Successfully saved URL");
          //redirect to JSON with saved info
          res.json({
            original_url: url.original_url,
            short_url: url.short_url
          });
        }
      });
    }
  });

 // New API endpoint to access shortened URL 
  app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = req.params.short_url;

    // Find the specific URL to use
    urlModel.findOne({ short_url: shortUrl }, (err, url) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect(url.original_url)
      }
    });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});