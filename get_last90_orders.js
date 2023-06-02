var util = require('util');
var getLib = require('./libs/getLib');
var miscLib = require('./libs/miscLib');
var parsingLib = require('./libs/parsingLib');

// getLib.get_commandes("last90",async function(body) {
//     // miscLib.save_content_to_file(body);
//     // result = await JSON.stringify(parsingLib.parse_commandes(body),null,4);
//     result = await (parsingLib.parse_commandes(body));
//     full_result = util.inspect(result, { depth: null });
//     json_result = JSON.stringify(result, null, 4);
//     console.log(json_result);
// });

getLib.get_commandes("2023", async function(orders) {
    // miscLib.save_content_to_file(orders);
    // full_result = util.inspect(orders, { depth: null });
    json_result = JSON.stringify(orders, null, 4);
    console.log(json_result);
});

// getLib.get_commandes_details("407-9360607-9692341", function(body) {
//     // miscLib.save_content_to_file(body);
//     console.log(parsingLib.parse_commandes_details(body));
// });

// authLib.login_amazon();
// getLib.get_commandes("last30", 0,
//     function(body) {
//         parsedObj = parsingLib.parse_commandes(body);
//         pages = parsedObj.pages;
//         if (pages.length > 1) {
//             orders = parsedObj.orders;
//             for (let index = 1; index < pages.length; index++) {
//                 getLib.get_commandes("last30", pages[index],
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
//     await getLib.get_commandes("last30", 0,
//         async function(body) {
//             miscLib.save_content_to_file(body);
//             pages_array = await parsingLib.commandes_get_number_pages(body)
//             console.log(pages_array);
//             pages_array.forEach(async function(pageIndex) {
//                 console.log("loop " + pageIndex);
//                 await getLib.get_commandes("last30", pageIndex,
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
// duration = "last30";
// async function main() {
//     await getLib.get_commandes(duration, 0,
//         async function(body) {
//             miscLib.save_content_to_file(body.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t'));
//             await parsingLib.commandes_get_number_pages(body).then(
//                 pages_array.forEach((pageIndex) => {
//                     console.log("loop " + pageIndex);
//                     getLib.get_commandes(duration, pageIndex,
//                         async function(body) {
//                             orders = await parsingLib.parse_commandes(body);
//                             orders_array.concat(orders);
//                             console.log(orders);
//                             console.log("page " + pageIndex)
//                         }
//                     );
//                 })
//             )
//             await parsingLib.parse_commandes(body).then(
//                 function(orders_array) {
//                     //foreach order get details
//                     orders_array.forEach((order) => {
//                         getLib.get_commandes_details(order.orderId, function(body) {
//                             // console.log("order " + order.orderId);
//                             console.log(parsingLib.parse_commandes_details(body));
//                             order.orderDetails = parsingLib.parse_commandes_details(body);
//                         });
//                     });
//                 }
//             )
//         }
//     ).then(
//         function() {
//             console.log("orders_array");
//             // console.log(orders_array);
//         }
//     )
// }
// main();
// console.log("orders_array");
// console.log(orders_array);
// console.log(orders);