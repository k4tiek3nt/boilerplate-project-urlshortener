require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//Added Body Parser
const bodyParser = require('body-parser');

//support parsing of app/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

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

// new API endpoint for post
app.post("/posturl",function(req,res,next){
    console.log(req.body);
    res.send("response");
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
