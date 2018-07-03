
var messageBuilder = require('./util/messageBuilder.js');
var dbCommunicator = require('./util/dbCommunicator.js');

function displayWelcomeMessage(callback){
    var speechletResponse = messageBuilder.buildSpeechletResponse(
        "Success",
       "You have ben succesfully connected to E Y SAP systems",
       "Now you can query specific results",
       false
    )
    var message = messageBuilder.buildResponse({},speechletResponse);
    callback(null,message);
}
function handleIntent (event,callback){
    if(event.request.intent.name === "total"){
        var aggregatorName = event.request.intent.slots.amount.value;
        dbCommunicator.getTotal(callback,aggregatorName);
    }else if(event.request.intent.name === "totalbydimension"){
        var aAggregatorName = event.request.intent.slots.amount.value.split(' ');
        dbCommunicator.getTotalByDimension(callback,aAggregatorName);
    }
}

exports.handler = (event, context, callback) => {
  try{
    if(event.session.new){
        displayWelcomeMessage(callback);
    }else if(event.request.type === 'IntentRequest'){
        handleIntent(event,callback);
    }
  }catch(err){
      callback(err);
  }
};
