const dialogflow = require("dialogflow");
const uuid = require("uuid");

// library contains methods https://github.com/googleapis/nodejs-dialogflow

//Project id comes https://console.dialogflow.com/api-client
exports.flow = function(req, res, next) {
  async function dialogFlowGetIntent(projectId = "streaming-229615") {
    const question = req.body.question;
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: question,
          // The language used by the client (en-US)
          languageCode: "en-US"
        }
      }
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    res.json({
      question: result.queryText,
      response: result.fulfillmentText,
      intent: result.intent.displayName
    });
  }

  dialogFlowGetIntent();
};
