var util = require('util');
var getLib = require('./libs/getLib');
var miscLib = require('./libs/miscLib');
var parsingLib = require('./libs/parsingLib');

let orderId = "407-8092850-624115";
let itemId = "Ug2JF9FyH";

getLib.get_tracking_infos(orderId, itemId, function(body) {
    miscLib.save_content_to_file(body, 'tracking_infos.html');
    // result = parsingLib.parse_tracking_infos(body);
    // json_result = JSON.stringify(result, null, 4);
    // console.log(json_result);
});