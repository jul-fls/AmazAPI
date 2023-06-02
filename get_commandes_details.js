var util = require('util');
var getLib = require('./libs/getLib');
var miscLib = require('./libs/miscLib');
var parsingLib = require('./libs/parsingLib');

let orderId = "403-2008283-7465943";

getLib.get_commandes_details(orderId, function(body) {
    // miscLib.save_content_to_file(body);
    result = parsingLib.parse_commandes_details(body);
    json_result = JSON.stringify(result, null, 4);
    console.log(json_result);
});