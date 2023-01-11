require('dotenv').config();
var request = require('request');
var fs = require('fs');
$req = request.defaults({ jar: true });

async function get_commandes(duration, index = 0, callback) {
    if (duration == 'last30') {
        $url = process.env.AMAZON_BASE_URL + 'gp/css/order-history?ie=UTF8&orderFilter=last30&startIndex=' + index;
    } else if (duration == 'last90') {
        $url = process.env.AMAZON_BASE_URL + 'gp/css/order-history?ie=UTF8&orderFilter=months-3&startIndex=' + index;
    } else if (parseInt(duration) > 1999) {
        $url = process.env.AMAZON_BASE_URL + 'gp/css/order-history?ie=UTF8&orderFilter=year-' + duration + '&startIndex=' + index;
    } else {
        $url = process.env.AMAZON_BASE_URL + 'gp/css/order-history?ie=UTF8&orderFilter=last30&startIndex=' + index;
    }
    //read cookies from file
    $cookies = fs.readFileSync('cookies.txt', 'utf8');
    $req({
        jar: true,
        method: 'GET',
        url: $url,
        headers: {
            'Cookie': $cookies
        }
    }, async function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            callback(body);
        }
    });
}

function get_commandes_details($orderId, callback) {
    $url = process.env.AMAZON_BASE_URL + 'gp/your-account/order-details/ref=ppx_yo_dt_b_order_details_o00?ie=UTF8&orderID=' + $orderId;
    $cookies = fs.readFileSync('cookies.txt', 'utf8');
    $req({
        jar: true,
        method: 'GET',
        url: $url,
        headers: {
            'Cookie': $cookies
        }
    }, async function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            callback(body);
        }
    });
}

function get_tracking_infos($orderId, $itemId, callback) {
    $url = process.env.AMAZON_BASE_URL + 'progress-tracker/package/ref=ppx_yo_dt_b_track_package?_encoding=UTF8&orderId=' + $orderId + '&itemId=' + $itemId;
    $cookies = fs.readFileSync('cookies.txt', 'utf8');
    $req({
        jar: true,
        method: 'GET',
        url: $url,
        headers: {
            'Cookie': $cookies
        }
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            callback(body);
        }
    });
}

module.exports = {
    get_commandes: get_commandes,
    get_commandes_details: get_commandes_details,
    get_tracking_infos: get_tracking_infos
};