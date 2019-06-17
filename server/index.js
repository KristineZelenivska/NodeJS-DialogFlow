const express = require("express");
//var https = require('https');
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./router.js");
const path = require("path");
const app = express();
const port = 4000;
const proxy = require('./proxy')

  // proxy.qlikAuth();

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../", "build")));

app.use("/api", router);

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "../", "build/index.html"));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


//proxy.qlikAuth();



