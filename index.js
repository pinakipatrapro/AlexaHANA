var messageBuilder = require('./util/messageBuilder.js');
var dbCommunicator = require('./util/dbCommunicator.js');
var errorHandler = require('./util/errorHandler/noData.js');
function displayWelcomeMessage(callback) {
    var speechletResponse = messageBuilder.buildSpeechletResponse(
        "Success",
        "You have ben succesfully connected to E Y SAP systems",
        "Now you can query specific results",
        false
    )
    var message = messageBuilder.buildResponse({}, speechletResponse);
    callback(null, message);
}

function displayExitMessage(callback) {
    var speechletResponse = messageBuilder.buildSpeechletResponse(
        "Goodbye",
        "You have ben succesfully disconnected from E Y SAP systems",
        "",
        true
    )
    var message = messageBuilder.buildResponse({}, speechletResponse);
    callback(null, message);
}

function handleIntent(event, callback) {
    try {
        if (event.request.intent.name === "total") {
            var aggregatorName = event.request.intent.slots.amount.value;
            dbCommunicator.getTotal(callback, aggregatorName);
        }
        else if (event.request.intent.name === "totalbydimension") {
            var aAggregatorName = event.request.intent.slots.amount.value.split(' ');
            dbCommunicator.getTotalByDimension(callback, aAggregatorName);
        }
        else if (event.request.intent.name === "totalwhere") {
            var ssvClauses = event.request.intent.slots;
            dbCommunicator.getTotalWithWhere(callback, ssvClauses);
        }else if (event.request.intent.name === "AMAZON.CancelIntent") {
            displayExitMessage(callback);
        } 
        else{
            errorHandler.sendNoDataReply(callback);
        }
    }
    catch (err) {
        errorHandler.sendNoDataReply(callback);
    }
}

exports.handler = (event, context, callback) => {
    try {
        if (event.session.new) {
            displayWelcomeMessage(callback);
        }
        else if (event.request.type === 'IntentRequest') {
            handleIntent(event, callback);
        }else{
            errorHandler.sendNoDataReply(callback);
        }
    }
    catch (err) {
        errorHandler.sendNoDataReply(callback);
    }
};
