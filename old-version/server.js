const express = require("express");
const bodyParser = require("body-parser");
// const cors = require("cors");
const router = require("./Router/routes");

const app = express();
const port = 3000;
// app.use(cors());
// app.options("*", cors());

// parse application/json
app.use(bodyParser.json());

router(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
