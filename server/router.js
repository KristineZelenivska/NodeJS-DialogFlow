const Dialog = require("./controllers/dialog-flow");
const qData = require("./controllers/getQlikTableData");
const express = require("express");

const router = express.Router();

router.get("/data/table", qData.getTableData);
router.get("/data/table2", qData.getTableData2);

router.post("/dialog", Dialog.flow);    

module.exports = router;
