require('dotenv').config();
var request = require('request');
var fs = require('fs');
$req = request.defaults({ jar: true });
var parsingLib = require('./parsingLib');
const cheerio = require('cheerio');

async function get_commandes(duration, callback) {
    const ordersPerPage = 10; // Number of orders per page

    let $url = process.env.AMAZON_BASE_URL + '/gp/css/order-history?ie=UTF8&orderFilter=';
    if (duration == 'last30') {
        $url += 'last30';
    } else if (duration == 'last90') {
        $url += 'months-3';
    } else if (parseInt(duration) > 1999) {
        $url += 'year-' + duration;
    } else {
        $url += 'last30';
    }

    let orders = [];
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
            const $ = cheerio.load(body);
            const orderCountText = $('span.num-orders').text();
            const orderCount = Number(orderCountText.replace(/[^0-9]/g, ''));
            const pageCount = Math.ceil(orderCount / ordersPerPage);

            if (pageCount > 0) {
                let promises = [];
                for (let i = 0; i < pageCount; i++) {
                    let $new_url = $url + '&startIndex=' + i * ordersPerPage;
                    promises.push(
                        new Promise((resolve, reject) => {
                            $req({
                                jar: true,
                                method: 'GET',
                                url: $new_url,
                                headers: {
                                    'Cookie': $cookies
                                }
                            }, function (error, response, body) {
                                if (error) {
                                    reject(error);
                                } else {
                                    let parsedObj = parsingLib.parse_commandes(body);
                                    resolve(parsedObj);
                                }
                            });
                        })
                    );
                }

                Promise.all(promises).then((results) => {
                    for (let i = 0; i < results.length; i++) {
                        orders = orders.concat(results[i]);
                    }
                    callback(orders);
                }).catch((err) => {
                    console.error(err);
                });

            } else {
                callback(orders);
            }
        }
    });
}



function get_commandes_details($orderId, callback) {
    $url = process.env.AMAZON_BASE_URL + '/gp/your-account/order-details/ref=ppx_yo_dt_b_order_details_o00?ie=UTF8&orderID=' + $orderId;
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
    // $url = process.env.AMAZON_BASE_URL + '/progress-tracker/package/ref=ppx_yo_dt_b_track_package?_encoding=UTF8&orderId=' + $orderId + '&itemId=' + $itemId;
    // https://www.amazon.fr/gp/your-account/ship-track?ref=ppx_yo2ov_dt_b_track_package&packageIndex=0&orderId=407-8092850-6241158&shipmentId=Ug2JF9FyH
    $url = process.env.AMAZON_BASE_URL + '/your-account/ship-track?ref=ppx_yo_dt_b_track_package?_encoding=UTF8&packageIndex=0&orderId=' + $orderId + '&shipmentId=' + $itemId;
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
            console.log(body);
            callback(body);
        }
    });
}

function getFile($url, $filename, callback) {
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
            fs.writeFileSync($filename, body, function(error) {
                if (error) {
                    return console.log(error);
                }
                console.log('The file was saved!');
            });
            callback(body);
        }
    });
}

module.exports = {
    get_commandes: get_commandes,
    get_commandes_details: get_commandes_details,
    get_tracking_infos: get_tracking_infos
};