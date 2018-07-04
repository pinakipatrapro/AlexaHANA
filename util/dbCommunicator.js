var columns = require('./metadata/columns.js');
var messageBuilder = require('./messageBuilder.js');
var errorHandler = require('./errorHandler/noData.js');

this.hostName = "https://fg8b51648f83.us1.hana.ondemand.com/Pinaki/AmazonAlexa/Data/Service/SuperstoreSales.xsodata/SuperstoreSales?$format=json";
this.uname = "DB_USER_3";
this.pwd = "Mysapclouddb12345"
var Client = require('node-rest-client').Client;
var options_auth = { user: this.uname, password: this.pwd };
var client = new Client(options_auth);


this.getTotal = function(callback, aggregatorName) {
    client.get(this.hostName + "&$select=" + aggregatorName.replace(/\s/g, ''), function(data, response) {

        try {
            var value = data.d.results[0][aggregatorName];
            var currency = "";
            if (data.d.results.length > 1) {
                value = data.d.results.length;
                var dimension = true;
            }
            else {
                var currency = " USD"; //TODO - Fetch Currency and bifrocate   
            }

            var speechletResponse = messageBuilder.buildSpeechletResponse(
                "",
                "Total " + aggregatorName + " is " + value + currency,
                "",
                false
            )
            var message = messageBuilder.buildResponse({}, speechletResponse);
            callback(null, message);
        }
        catch (e) {
            errorHandler.sendNoDataReply(callback);
        }
    })

}


this.getTotalByDimension = function(callback, aAggregatorName) {
    client.get(this.hostName + "&$select=" + aAggregatorName.join(','), function(data, response) {
        try {
            var aResults = data.d.results;
            var resultString = "";
            var aAggregatorMes = [];
            var aAggregatorDim = [];
            //Identify measure and dimension
            aAggregatorName.forEach(function(e) {
                if (parseFloat(aResults[0][e])) {
                    aAggregatorMes.push(e)
                }
                else {
                    aAggregatorDim.push(e)
                }
            });
            // create out string
            for (var i = 0; i < aResults.length; i++) {
                // Create dimension string
                var dimensionString = "";
                aAggregatorDim.forEach(function(f) {
                    dimensionString = dimensionString + " " + aResults[i][f] + " " + f;
                })
                // Create measure string
                var measureString = "";
                aAggregatorMes.forEach(function(f) {
                    measureString = measureString + " " + f + " is " + aResults[i][f];
                })
                resultString = resultString + " For " + dimensionString + " the total " + measureString + ", ";
            }
            var outputString = " Total of " + data.d.results.length + " results found , " + resultString.substring(0, resultString.length - 1);

            var speechletResponse = messageBuilder.buildSpeechletResponse("",
                outputString,
                " was it helpful ?", false
            )
            var message = messageBuilder.buildResponse({}, speechletResponse);
            callback(null, message);
        }
        catch (e) {
            errorHandler.sendNoDataReply(callback);
        }
    })
}

this.getTotalWithWhere = function(callback, ssvClauses) {
    try {
        var measure = ssvClauses.amount.value;
        var whereCaluse = ssvClauses.wherecaluse.value.replace(/and/g, "");;
        var aClause = whereCaluse.split(' ');
        var aClauseDim = [],
            aCaluseVal = [];

        aClause.forEach(function(e) {
            if (columns.view.indexOf(e) > -1) {
                aClauseDim.push(e);
            }
            else {
                aCaluseVal.push(e);
            }
        });

        var aCaluseStatement = [];
        var aReplyStatement = [];

        for (var i = 0; i < aClauseDim.length; i++) {
            aCaluseStatement.push("tolower(" + aClauseDim[i] + ") eq '" + aCaluseVal[i] + "'");
            aReplyStatement.push(" for the " + aClauseDim[i] + "  " + aCaluseVal[i])
        }
        var filterString = "&$filter=(" + aCaluseStatement.join(" and ") + ")";
        console.log(this.hostName + "&$select=" + measure.replace(/\s/g, '') + filterString);
        client.get(this.hostName + "&$select=" + measure.replace(/\s/g, '') + filterString, function(data, response) {
            var value = data.d.results[0][measure];
            var currency = "";
            if (data.d.results.length > 1) {
                value = data.d.results.length;
                var dimension = true;
            }
            else {
                var currency = " USD"; //TODO - Fetch Currency and bifrocate   
            }

            var speechletResponse = messageBuilder.buildSpeechletResponse(
                "",
                "Total " + measure + " is " + value + currency + aReplyStatement.join(' and '),
                "",
                false
            )
            var message = messageBuilder.buildResponse({}, speechletResponse);
            callback(null, message);
        })
    }
    catch (e) {
        errorHandler.sendNoDataReply(callback);
    }

}
