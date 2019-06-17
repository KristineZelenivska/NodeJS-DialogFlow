const dialogflow = require("dialogflow");
const allMeetings = require("../../public/meetingData_new.json");
const allMeetingsFlat = require("../../public/table.json");

var agent = require("../../server/df/othertry.json");

const config = {
  credentials: {
    private_key: agent.private_key,
    client_email: agent.client_email
  }
};

// library contains methods https://github.com/googleapis/nodejs-dialogflow

//Project id comes https://console.dialogflow.com/api-client
exports.flow = function(req, res, next) {
  async function dialogFlowGetIntent(projectId = agent.project_id) {
    let question = req.body.question;
    // A unique identifier for the given session
    // const sessionId = uuid.v4();
    const sessionId = "387b7c29c215406881eb2c4d3bfada26";

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    const contextsClient = new dialogflow.ContextsClient();
    const contextPath = contextsClient.contextPath(
      projectId,
      sessionId,
      "Questions"
    );
    // The text query request.
    let request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: question,
          // The language used by the client (en-US)
          languageCode: "en-US"
        }
      },
      contexts: [
        {
          name: contextPath,
          parameters: {},
          lifespanCount: 2
        }
      ]
    };
    let response = await sessionClient.detectIntent(request);
    let parsedResponse = response[0].queryResult;
    res.json(createResponse(parsedResponse));
  }
  dialogFlowGetIntent();
};


function createResponse(parsedResponse) {
  let intentName = parsedResponse.intent.displayName;
  console.log(intentName);
  let res='';
  switch (intentName) {
    case "EditMeeting":
      res = editMeetingResponse();
      break;
    case "EM-f1-Schedule":
      res = emScheduleResponse();
      break;
    case "EM-f1-Schedule - yes - details":
      res = emDetailsResponse(parsedResponse);
      break;
    case "After_meeting_start":
      res = reportResponse();
      break;
    case "meeting_feedback_intent":
      res = createReportResponse(parsedResponse);
      break;
    case "meeting_feedback_any_news":
      res = createReportNewsResponse(parsedResponse);
      break;
    case "meeting_feedback_any_news - yes":
      res = createReportYesResponse();
      break;
    case "meeting_feedback_any_news - no":
      res = createReportNoResponse();
      break;
    case "meeting_feedback_any_news - yes - no":
      res = createReportYesNoResponse();
      break;
    case "meeting_feedback_any_news - yes - yes":
      res = createReportYesYesResponse();
      break;
    case "Preaper_meeting":
    res = prepareMeetingResponse()
    break;
    case "Get_product_key":
    res = productKeyResponse()
    break;
    default:
      res = {
        response: parsedResponse.fulfillmentText
      };
      break;
  }
  return res;
}

//gets the list of today's meetings
function editMeetingResponse() {
  let todaysMeetings = []; 
  let i;

  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ("43570" === meetingDate) {
todaysMeetings.push(allMeetings[i]);
    }
  }
  let countMeetings = 0
  let countMeetings1 = 0
  let countMeetings2 = 0
  for (i = 0; i < todaysMeetings.length; i++) {
    switch (todaysMeetings[i].hospitalAdress) {
      case "Adam House":
      countMeetings = countMeetings + 1
      break;
      case "14 Fitzroy Square":
      countMeetings1 = countMeetings1 + 1
      break;
      case "27 Welbeck Street":
      countMeetings2 = countMeetings2 + 1
      break;
      default:
      console.log('default')
      break;
    }
  }
  let res;
  res = {
    response: `You have ${todaysMeetings.length} meetings planned for today. You have ${countMeetings} meetings in Adam House. ${countMeetings1} meeting in 14 Fitzroy Square. ${countMeetings1} meeting in 27 Welbeck Street. You have 3 action alerts. Would you like to speak about schedule or alerts?`,
    displayText: "Something worked!!!",
    source: "team info"
  };

  return res;
}

//gets list of doctors of today's meetings
function emScheduleResponse() {
  var ScheduleInfo = "";
  let todaysMeetings = []; 
  let i;
  let comma = "";
  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ("43570" === meetingDate) {
    todaysMeetings.push(allMeetings[i]);
    }
  }
for (i = 0; i < todaysMeetings.length; i++) {
  if(todaysMeetings[i] === todaysMeetings[todaysMeetings.length - 1]){
comma = "."
} else {
comma = ", "
}
ScheduleInfo = ScheduleInfo +"doctor " + todaysMeetings[i].profName + " at " + todaysMeetings[i].interactionTime.replace(':00', " o'clock") + comma;


}
  let res;

  res = {
    response: `Today you have meetings with ${ScheduleInfo} Would you like to hear more about particular meeting?`,
    displayText: "Something worked!!!",
    source: "team info"
  };

  return res;
}

//gets one meeting depending on user's request
function emDetailsResponse(parsedResponse) {
  var todaysMeetings = [];
  let i;

  for (i = 0; i < allMeetings.length; i++) {
    function ordinal_suffix_of(i) {
      var j = i % 10,
        k = i % 100;
      if (j == 1 && k != 11) {
        return i + "st";
      }
      if (j == 2 && k != 12) {
        return i + "nd";
      }
      if (j == 3 && k != 13) {
        return i + "rd";
      }
      return i + "th";
    }

    let meetingDate = allMeetings[i].interactionDate;
    var askedOrder = parsedResponse.parameters.fields.ordinal.listValue.values[0].numberValue;
    if ("43570" === meetingDate) {
      todaysMeetings.push(allMeetings[i]);
    }
  }
  var DrName = todaysMeetings[askedOrder - 1].profName;
  var MeetTopic = todaysMeetings[askedOrder - 1].interactionTopic;
  var MeetHospital = todaysMeetings[askedOrder - 1].hospitalName;
  var ordinalNumber = ordinal_suffix_of(askedOrder);
  var MeetTime = todaysMeetings[askedOrder - 1].interactionTime.replace(':00', " o'clock")
  let res;

  res = {
    response: `Your ${ordinalNumber} meeting is with ${DrName} at ${MeetTime} in ${MeetHospital}. Topic of this meeting is ${MeetTopic}. What would you like to do next?`,
    displayText: "Something worked!!!",
    source: "team info"
  };

  return res;
}


//gets exact meeting to which create report(notes)
function reportResponse() {
  var todaysMeeting = [];
  let i;

  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ("43570" === meetingDate) {
      todaysMeeting.push(allMeetings[i]);
    }
  }
  let DoctorName = todaysMeeting[0].profName;
  let MeetTime = todaysMeeting[0].interactionTime.replace(':00', " o'clock");
  let res;
  res = {
    response: `Do you want to create a report for your meeting with ${DoctorName}, today at ${MeetTime}?`,
    displayText: "Something worked!!!",
    source: "team info"
  };

  return res;
}

//creates partial report on chosen meeting
function createReportResponse(parsedResponse) {
  var todaysMeeting = [];
  let i;
  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ("43570" === meetingDate) {
      todaysMeeting.push(allMeetings[i]);
    }
  }
  let todaysMeetingNotes = [todaysMeeting[0]];
  let fieldsAnswer = parsedResponse.parameters.fields;
  if (
    fieldsAnswer.Preaper_meeting_answer.stringValue !== "" &&
    fieldsAnswer.topic.stringValue !== "" &&
    fieldsAnswer.after_meeting_defaut.stringValue !== ""
  ) {
    const addNotes = () => {
      todaysMeetingNotes[0].visitReport = {
        result: fieldsAnswer.Preaper_meeting_answer.stringValue,
        topic: fieldsAnswer.topic.stringValue,
        presentation: fieldsAnswer.after_meeting_defaut.stringValue,
      }
    };
    addNotes(),
      (res = {
        response: parsedResponse.fulfillmentText,
        notesRes: todaysMeetingNotes,
        command: "add part of notes",
        source: "team info"
      });
    return res;
  }
  res = {
    response: parsedResponse.fulfillmentText,
    displayText: "something worked",
    source: "team info"
  };

  return res;
}

//adds to partial report info about competitors
function createReportNewsResponse(parsedResponse) {
  res.notesRes[0].visitReport = {
        result: res.notesRes[0].visitReport.result,
        topic: res.notesRes[0].visitReport.topic,
        competition: parsedResponse.parameters.fields.after_meeting_defaut.stringValue,
        presentation: res.notesRes[0].visitReport.presentation,
      }
      res = {
        response: parsedResponse.fulfillmentText,
        NewsData: res.notesRes,
        command: "add part of notes",
        source: "team info"
      };
    return res;
}

//creates report for chosen meeting
function createReportYesResponse() {
  res.NewsData[0].visitReport = {
        result: res.NewsData[0].visitReport.result,
        topic: res.NewsData[0].visitReport.topic,
        competition: res.NewsData[0].visitReport.competition,
        presentation: res.NewsData[0].visitReport.presentation,
        followUpMeetingSchedueled: "Yes",
      }
      res = {
        response: "The ideal frequency for this doctor is 30 days and your calendar is clear on 06/03/2019. Is this OK?",
        newData: res.NewsData,
        command: "add notes full",
        source: "team info"
      };
    return res;
}
//creates report for chosen meeting
function createReportNoResponse() {
  res.NewsData[0].visitReport = {
        result: res.NewsData[0].visitReport.result,
        topic: res.NewsData[0].visitReport.topic,
        competition: res.NewsData[0].visitReport.competition,
        presentation: res.NewsData[0].visitReport.presentation,
        followUpMeetingSchedueled: "No",
      }
      if(res.NewsData[0].visitReport.presentation === "yes"){
       var presentationRes = "You have shared a presentations"
      } else {
      var presentationRes = "You have not shared any presentations"
      }

      if(res.NewsData[0].visitReport.competition === "yes"){
       var competitonRes = "there is news from the competition"
      } else {
      var competitonRes = "there is no news from the competition"
      }
      res = {
        response: `OK, the result of previous meeting was ${res.NewsData[0].visitReport.result}. You discussed ${res.NewsData[0].visitReport.topic}. ${presentationRes} and ${competitonRes}. What would you like to do next?`,
        notesData: res.NewsData,
        command: "add notes full",
        source: "team info"
      };
    return res;
}

//creates report for chosen meeting
function createReportYesNoResponse() {
  res.newData[0].visitReport = {
    result: res.newData[0].visitReport.result,
    topic: res.newData[0].visitReport.topic,
    competition: res.newData[0].visitReport.competition,
    presentation: res.newData[0].visitReport.presentation,
    followUpMeetingSchedueled: "no",
      }

      if(res.newData[0].visitReport.presentation === "yes"){
        var presentationRes = "You have shared a presentations"
       } else {
       var presentationRes = "You have not shared any presentations"
       }
 
       if(res.newData[0].visitReport.competition === "yes"){
        var competitonRes = "there is news from the competition"
       } else {
       var competitonRes = "there is no news from the competition"
       }
 
      res = {
        response: `OK, the result of previous meeting was ${res.newData[0].visitReport.result}. You discussed ${res.newData[0].visitReport.topic}. ${presentationRes} and ${competitonRes}. You can create follow-up meeting manually in any time. What would you like to do next?`,
        notesData: res.newData,
        command: "add notes full",
        source: "team info"
      };
    return res;
}
//creates report for chosen meeting
function createReportYesYesResponse() {
  res.newData[0].visitReport = {
    result: res.newData[0].visitReport.result,
    topic: res.newData[0].visitReport.topic,
    competition: res.newData[0].visitReport.competition,
    presentation: res.newData[0].visitReport.presentation,
    followUpMeetingSchedueled: "yes",
    followUpMeeting: "06/03/2019"
  }
  if(res.newData[0].visitReport.presentation === "yes"){
    var presentationRes = "You have shared a presentations"
   } else {
   var presentationRes = "You have not shared any presentations"
   }

   if(res.newData[0].visitReport.competition === "yes"){
    var competitonRes = "there is news from the competition"
   } else {
   var competitonRes = "there is no news from the competition"
   }

      res = {
        response: `Ok, the result of previous meeting was ${res.newData[0].visitReport.result}. You discussed ${res.newData[0].visitReport.topic}. ${presentationRes} and ${competitonRes}. The next follow-up meeting will be on 06/03/2019. What would you like to do next?`,
        notesData: res.newData,
        command: "add notes full",
        source: "team info"
      };
    return res;
}

//prepare for next meeting response
function prepareMeetingResponse() {
  var todaysMeeting = [];
  let i;

  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ("43570" === meetingDate) {
      todaysMeeting.push(allMeetings[i]);
    }
  }
  
  let profName = todaysMeeting[0].profName
  let HospitalName = todaysMeeting[0].hospitalName
  let Adress = todaysMeeting[0].hospitalAdress
  let Topic = todaysMeeting[0].interactionTopic
  let Tier = todaysMeeting[0].Tier
  let Specialization = todaysMeeting[0].DepartmentName
  let Rank = todaysMeeting[0].PrescriberRank
  let primaryBrand = todaysMeeting[0].primaryBrand
  let Segmentation = todaysMeeting[0].Cohort
  let latestInteractionDate = todaysMeeting[0].latestInteractionDate
  let NBAText = todaysMeeting[0].NBAText

  res = {
    response: `Your next visit will be with doctor ${profName} at ${HospitalName} in ${Adress} to discuss ${Topic}. Doctor ${profName} is a ${Tier} HCP specialising in ${Specialization}. He ranks ${Rank} in your top prescribers, he's not prescribed ${primaryBrand} in the past 3 months. Doctor ${profName} is segmented as a ${Segmentation}. You last visited him ${latestInteractionDate} days ago to discuss ${Topic}. The next best action is ${NBAText}. I have found 1 news item relevant to Doctor ${profName}. Shall I read them to you?`,
    command: "prepare for next meeting",
    source: "team info"
  };
return res;
}

function productKeyResponse() {
  let todaysMeetingsFlat = [];
  let i;

  for (i = 0; i < allMeetings.length; i++) {
    let meetingDate = allMeetings[i].interactionDate;
    if ( "43570" === meetingDate) {
      todaysMeetingsFlat.push(allMeetings[i]);
    }
  }
  let NBALongtext = todaysMeetingsFlat[0].NBALongtext;

  res = {
    response: `The brand message is ${NBALongtext}. Do you want anything else?`,
    command: "prepare for next meeting",
    source: "team info"
  };
return res;

}