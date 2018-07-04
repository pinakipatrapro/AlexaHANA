var messageBuilder = require('../messageBuilder.js');

this.sendNoDataReply=function(callback){
    var speechletResponse = messageBuilder.buildSpeechletResponse(
            "Sorry! I could not find any relevant information. Please try again.",
            "Sorry! I could not find any relevant information. Please try again.",
            "Sorry! I could not find any relevant information. Please try again.",
            false
        )
        var message = messageBuilder.buildResponse({}, speechletResponse);
        callback(null, message);
}