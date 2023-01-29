var util = require('util');
$itemId = "kmqkmxqtsorqqo";
$orderId = "407-9360607-9692341";
var getLib = require('./libs/getLib');
var miscLib = require('./libs/miscLib');
var parsingLib = require('./libs/parsingLib');
var authLib = require('./libs/authLib');
// getLib.get_tracking_infos($orderId,$itemId,function(body) {
//     // miscLib.save_html(body);
//     console.log(parsingLib.parse_tracking_infos(body));
// });

// getLib.get_commandes("last90",0,function(body) {
//     // miscLib.save_html(body);
//     console.log(JSON.stringify(parsingLib.parse_commandes(body),null,4));
// });

// getLib.get_commandes_details("407-9360607-9692341", function(body) {
//     // miscLib.save_html(body);
//     console.log(parsingLib.parse_commandes_details(body));
// });

// authLib.login_amazon();
// getLib.get_commandes("last90", 0,
//     function(body) {
//         parsedObj = parsingLib.parse_commandes(body);
//         pages = parsedObj.pages;
//         if (pages.length > 1) {
//             orders = parsedObj.orders;
//             for (let index = 1; index < pages.length; index++) {
//                 getLib.get_commandes("last90", pages[index],
//                     function(body) {
//                         parsedObj = parsingLib.parse_commandes(body);
//                         orders = orders.concat(parsedObj.orders);
//                     }
//                 );
//             }
//             console.log(orders);
//         } else {
//             console.log(parsedObj.orders);
//         }
//         orders += parsedObj.orders;
//         console.log(JSON.stringify(orders, null, 4));
//     }
// );
// pages_array = [];
// async function main() {
//     await getLib.get_commandes("last90", 0,
//         async function(body) {
//             miscLib.save_html(body);
//             pages_array = await parsingLib.commandes_get_number_pages(body)
//             console.log(pages_array);
//             pages_array.forEach(async function(pageIndex) {
//                 console.log("loop " + pageIndex);
//                 await getLib.get_commandes("last90", pageIndex,
//                     async function(body) {
//                         console.log("page " + pageIndex);
//                         orders = await parsingLib.parse_commandes(body);
//                         orders.push(orders);
//                     }
//                     // console.log("page " + pageIndex)
//                 );
//             });
//         }
//     );
// }
duration = "last30";
async function main() {
    // authLib.login_amazon();
    await getLib.get_commandes(duration, 0,
        async function(body) {
            miscLib.save_html(body.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t'));
            // await parsingLib.commandes_get_number_pages(body).then(
            //     pages_array.forEach((pageIndex) => {
            //         console.log("loop " + pageIndex);
            //         getLib.get_commandes(duration, pageIndex,
            //             async function(body) {
            //                 orders = await parsingLib.parse_commandes(body);
            //                 orders_array.concat(orders);
            //                 console.log(orders);
            //                 console.log("page " + pageIndex)
            //             }
            //         );
            //     })
            // )
            await parsingLib.parse_commandes(body).then(
                function(orders_array) {
                    //foreach order get details
                    orders_array.forEach((order) => {
                        getLib.get_commandes_details(order.orderId, function(body) {
                            // console.log("order " + order.orderId);
                            console.log(parsingLib.parse_commandes_details(body));
                            order.orderDetails = parsingLib.parse_commandes_details(body);
                        });
                    });
                }
            )
        }
    ).then(
        function() {
            // console.log("orders_array");
            // console.log(orders_array);
        }
    )
}
main();
// console.log("orders_array");
// console.log(orders_array);
// console.log(orders);