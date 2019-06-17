const Dialog = require("../controllers/dialog-flow");

module.exports = function(app) {
  app.post("/api/dialog", Dialog.flow);
};
