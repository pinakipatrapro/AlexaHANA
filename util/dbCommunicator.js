var messageBuilder = require('./messageBuilder.js');
this.hostName = "https://fg8b51648f83.us1.hana.ondemand.com/Pinaki/AmazonAlexa/Data/Service/SuperstoreSales.xsodata/SuperstoreSales?$format=json";
this.uname = "DB_USER_3";
this.pwd = "Mysapclouddb12345"
var Client = require('node-rest-client').Client;
var options_auth = { user: this.uname, password: this.pwd };
var client = new Client(options_auth);


this.getTotal = function(callback, aggregatorName) {
    client.get(this.hostName + "&$select=" + aggregatorName.replace(/\s/g,''), function(data, response) {
        var value = data.d.results[0][aggregatorName];
        var currency = "";
        if(data.d.results.length > 1){
            value = data.d.results.length;
            var dimension = true;
        }else{
          var currency = " USD";  //TODO - Fetch Currency and bifrocate   
        }
        
        var speechletResponse = messageBuilder.buildSpeechletResponse(
            "",
            "Total " + aggregatorName + " is " + value + currency,
            "",
            false
        )
        var message = messageBuilder.buildResponse({}, speechletResponse);
        callback(null, message);
    })
}


this.getTotalByDimension = function(callback, aAggregatorName) {
    client.get(this.hostName + "&$select=" + aAggregatorName.join(','), function(data, response) {
        var aResults =data.d.results;
        var resultString = "";
        var aAggregatorMes = [];
        var aAggregatorDim = [];
        //Identify measure and dimension
        aAggregatorName.forEach(function(e){
            if(parseFloat(aResults[0][e])){
               aAggregatorMes.push(e)
            }else{
                aAggregatorDim.push(e)            
            }
        });
        // create out string
        for(var i=0;i<aResults.length;i++){
            // Create dimension string
            var dimensionString = "";
            aAggregatorDim.forEach(function(f){
                dimensionString = dimensionString + " " + aResults[i][f]+" "+ f;
            })
            // Create measure string
            var measureString = "";
            aAggregatorMes.forEach(function(f){
                measureString = measureString + " "+f+" is " + aResults[i][f];
            })
            resultString = resultString + " For "+dimensionString + " the total " + measureString + ", ";
        }
        var outputString = " Total of " + data.d.results.length + " results found , " + resultString.substring(0, resultString.length - 1) ;

        var speechletResponse = messageBuilder.buildSpeechletResponse("",
            outputString ,
            "",false
        )
        var message = messageBuilder.buildResponse({}, speechletResponse);
        callback(null, message);
    })
}