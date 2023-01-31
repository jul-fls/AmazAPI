var cheerio = require('cheerio');
require('dotenv').config();

function parse_tracking_infos(body) {
    $ = cheerio.load(body);
    available = $("#errorPageContainer").length == 0;
    if (available) {
        track_infos_object = {};
        courrier_array = $("#tracking-events-container > div > div.a-row.tracking-event-carrier-header > h2").text().split(" ");
        courrier_array = courrier_array.filter(function(n) {
            return n != "";
        });
        courrier = courrier_array[courrier_array.length - 1];
        courrier = courrier.replace("\n", "");
        status_array = $("#primarystatut").text().split(" ");
        status_array = status_array.map(function(item) {
            return item.replace('\n', '');
        });
        status_array = status_array.filter(function(n) {
            return n != "";
        });
        status_str = status_array[0];
        track_infos_object.courrier = courrier;
        track_infos_object.status = status_str;
        //if lowercase body contains "locker"
        if (body.toLowerCase().includes("locker")) {
            track_infos_object.is_locker = true;
        } else {
            track_infos_object.is_locker = false;
        }
        if(track_infos_object.is_locker) {
            pickup_code_raw = $("#pickupInformation-container > h1").text().split(":")[1];
            if(pickup_code_raw != undefined) {
                pickup_code = pickup_code_raw.trim();
                barcode = $("#pickupInformation-container > img").attr("src");
                track_infos_object.pickup_code = pickup_code;
                track_infos_object.barcode = barcode;
            }
        }
        tracking_number = $("#tracking-events-container > div > div.a-row.tracking-event-trackingId-text > h4").html().split("\n")[1].split(":")[1].trim();
        track_infos_object.tracking_number = tracking_number;
        updates = $("#tracking-events-container > div > div > div");
        updates_object = [];
        updates.each(function(i, el) {
            if (el.attribs.class == "a-row tracking-event-date-header") {
                $date = ($(this).text().split("\n")[1].split("\n")[0].trim()) + " 2022";
                $date = $date.split(" ");
                $date = $date[1].padStart(2, "0") + "/" + $date[2] + "/" + $date[3];
                $date = $date.replace("janvier", "01");
                $date = $date.replace("février", "02");
                $date = $date.replace("mars", "03");
                $date = $date.replace("avril", "04");
                $date = $date.replace("mai", "05");
                $date = $date.replace("juin", "06");
                $date = $date.replace("juillet", "07");
                $date = $date.replace("août", "08");
                $date = $date.replace("septembre", "09");
                $date = $date.replace("octobre", "10");
                $date = $date.replace("novembre", "11");
                $date = $date.replace("décembre", "12");
            } else {
                update_object = {};
                update_object.date = $date;
                time = $(this).children(".a-column.a-span3.tracking-event-time-left.vertical-line-wrapper").children("span").text();
                if (time != "") {
                    update_object.hour = time.split(":")[0].padStart(2, "0");
                    update_object.minute = time.split(":")[1].padStart(2, "0");
                    update_object.time = update_object.hour + ":" + update_object.minute;
                }
                message = $(this).children(".a-column.a-span9.tracking-event-time-right.a-span-last").children("div:nth-child(1)").children("span").text().split("\n")[0];
                if (message != "") {
                    update_object.message = message;
                }
                place = $(this).children(".a-column.a-span9.tracking-event-time-right.a-span-last").children("div:nth-child(2)").children("span").text().split("\n")[0];
                if (place != "") {
                    update_object.place = place;
                }
                updates_object.push(update_object);
            }
        });
        track_infos_object.tracking_updates = updates_object;
        return track_infos_object;
    } else {
        return false;
    }
}

function decodeEntities(encodedString) {
    translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}


async function parse_commandes(body) {
    body = body.replace(/<script type="text\/javascript">if \(typeof uet === "function"\) { uet\('cf'\); }<\/script>/g, "");
    body = body.replace(/<script type="text\/javascript">if \(typeof uet == 'function'\) { uet\('af'\); }<\/script>/g, "");
    $ = cheerio.load(body);
    available = $("#authportal-center-section").length == 0;
    if (available) {
        orders_array = [];
        orders = $(".order");
        orders.each(function(i, el) {
            order_object = {};
            details_link = $(this).find(".a-link-normal.yohtmlc-order-details-link").attr("href");
            order_object.details_link = process.env.AMAZON_BASE_URL + "/" + (details_link.slice(1));
            order_object.orderId = $(this).find("bdi").text();
            shipments_array = [];
            shipments = $(this).find(".shipment");
            shipments.each(function(i, el) {
                shipment_object = {};
                tracking_link = $(this).find(".track-package-button").children("span").children("a").attr("href");
                if (tracking_link != undefined) {
                    shipment_object.itemId = tracking_link.split("itemId=")[1].split("&")[0];
                    shipment_object.tracking_link = process.env.AMAZON_BASE_URL + "/" + (tracking_link.split("&packageIndex")[0].slice(1));
                }

                status = $(this).find(".js-shipment-info-container > div > div > span.a-size-medium").text().replaceAll("\n", "").trim();
                status_color = $(this).find(".js-shipment-info-container > div:not([class]) span[class*=color]").attr("class").split("a-color-")[1].split(" ")[0];
                if (status_color == "success") {
                    is_delivered = false;
                } else {
                    is_delivered = true;
                }
                shipment_object.is_delivered = is_delivered;
                description = $(this).find(".js-shipment-info-container > div > div > div.a-row").text().replaceAll("\n", "").trim();
                if (description == "") {
                    description = $(this).find(".js-shipment-info-container > div > div > span.a-color-secondary").text().replaceAll("\n", "").trim();
                }

                if (status != "") {
                    shipment_object.status = status;
                }
                if (description != "") {
                    shipment_object.description = description;
                }
                products_array = [];
                products = $(this).find("*:is(.a-spacing-base, .a-spacing-none).a-fixed-left-grid");
                products.each(function(i, el) {
                    product_object = {};
                    product_object.name = $(this).find(".yohtmlc-item .a-link-normal").text().replaceAll("\n", "").trim();
                    product_object.link = process.env.AMAZON_BASE_URL + "/" + ($(this).find(".yohtmlc-item .a-link-normal").attr("href").slice(1)).split("/ref")[0];
                    img = $(this).find(".a-fixed-left-grid-inner > div > div > a > img").attr("data-src");
                    if(img == undefined) {
                        img = $(this).find(".a-fixed-left-grid-inner > div > div > a > img").attr("src");
                    }
                    product_object.image = img;
                    return_text = $(this).find(".yohtmlc-item .a-row.a-size-small").text().replaceAll("\n", "").trim();
                    if (return_text != "") {
                        product_object.return_text = return_text;
                    }
                    product_item_id = $(this).find('.yohtmlc-item .a-row .a-button-inner > a[href*="ItemId="]').attr("href");
                    if(product_item_id != undefined) {
                        product_object.itemId = product_item_id.split("ItemId=")[1].split("&")[0];
                    }
                    products_array.push(product_object);
                });
                shipment_object.products = products_array;
                shipments_array.push(shipment_object);
            });
            order_object.shipments = shipments_array;
            order_object.order_date = $(this).find(".a-column.a-span4 .a-color-secondary.value").text().replaceAll("\n", "").trim();
            //convert date like "20 janvier 2023" to "20/01/2023" and make it work internationally
            order_object.order_date = new Date(order_object.order_date.split(" ")[1] + "/" + order_object.order_date.split(" ")[0] + "/" + order_object.order_date.split(" ")[2]);
            //format date to "01/06/2021" and add leading 0
            order_object.order_date = ("0" + order_object.order_date.getDate()).slice(-2) + "/" + ("0" + (order_object.order_date.getMonth() + 1)).slice(-2) + "/" + order_object.order_date.getFullYear();
            payment_object = {};
            payment_object.total_amount = parseFloat($(this).find(".a-column.a-span2 .a-color-secondary.value").text().replaceAll("\n", "").trim().replaceAll(",", ".").substring(1));
            payment_object.currency = ($(this).find(".a-column.a-span2 .a-color-secondary.value").text().replaceAll("\n", "").trim().split(" ")[0])[0];
            order_object.payment = payment_object;

            order_delivery_infos_raw = $(this).find('span[data-a-popover*="recipient-address"]').attr("data-a-popover");
            fixedJsonString = order_delivery_infos_raw.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            });
              
            order_delivery_infos = fixedJsonString.replaceAll(`\\n`,"").replaceAll(`\\`,"").split('displayAddressUL">')[1].split('</ul>')[0].trim()
            delivery_infos_object = {};
            liArray = order_delivery_infos.split('</li>');
            liArray.pop();
            liArray.forEach(li => {
            className = li.match(/displayAddress\w+/g)[1].replace('displayAddress', '');
            value = li.split('>')[1].trim();
            if (className === 'FullName') {
                delivery_infos_object.name = value.trim();
            } else if (className === 'AddressLine1') {
                delivery_infos_object.address = value.trim();
            } else if (className === 'CityStateOrRegionPostalCode') {
                [city, zipcode] = value.split(', ');
                delivery_infos_object.city = city.trim();
                delivery_infos_object.zipcode = zipcode.trim();
            } else if (className === 'CountryName') {
                delivery_infos_object.country = value.trim();
            } else if (className === 'PhoneNumber') {
                phoneNumber = li.split('>')[2].split('<')[0].trim();
                delivery_infos_object.phonenumber = phoneNumber;
            }
            });
            if (delivery_infos_object.name.toLowerCase().includes("locker")) {
                delivery_infos_object.is_locker = true;
            } else {
                delivery_infos_object.is_locker = false;
            }
            order_object.delivery_infos = delivery_infos_object;
            orders_array.push(order_object);
        });
        //sort orders by order date
        orders_array.sort(function(a, b) {
            return new Date(b.order_date) - new Date(a.order_date);
        });
        return orders_array;
    } else {
        return false;
    }
}

async function commandes_get_number_pages(body) {
    body = body.replace(/<script type="text\/javascript">if \(typeof uet === "function"\) { uet\('cf'\); }<\/script>/g, "");
    body = body.replace(/<script type="text\/javascript">if \(typeof uet == 'function'\) { uet\('af'\); }<\/script>/g, "");
    $ = cheerio.load(body);
    available = $("#authportal-center-section").length == 0;
    if (available) {
        orders_number = (Math.ceil(parseInt($(".num-orders").text()) / 10) * 10);
        pages_array = [];
        for (i = 0; i < orders_number; i += 10) {
            pages_array.push(i);
        }
        return pages_array;
    } else {
        return false;
    }
}

function parse_commandes_details(body) {
    $ = cheerio.load(body);

    order_details_object = {};

    order_details_object.orderId = $("bdi[dir=ltr]").text();
    date_arr = $("#orderDetails > div:nth-child(3) > div.a-column.a-span9.a-spacing-top-mini > div > span:nth-child(1)").text().replaceAll("\n", "").trim().split(" ");
    order_details_object.date = date_arr[date_arr.length - 3] + " " + date_arr[date_arr.length - 2] + " " + date_arr[date_arr.length - 1];

    order_address_object = {};
    order_address_object.fullname = $(".displayAddressFullName").html().split("<")[0].trim();
    order_address_object.address = $(".displayAddressAddressLine1").text();
    order_address_object.city = $(".displayAddressCityStateOrRegionPostalCode").text().split(",")[0];
    order_address_object.zipcode = $(".displayAddressCityStateOrRegionPostalCode").text().split(", ")[1].split(" ")[1];
    order_address_object.country = $(".displayAddressCountryName").text();
    order_details_object.address = order_address_object;

    order_payment_object = {};
    order_payment_object.method = $(".a-section .a-spacing-none").children("div").children("img").attr("alt");
    order_payment_object.last4digits = $(".a-section .a-spacing-none").children("div").children("span").text().split(" ")[1];
    order_payment_object.card_image = $(".a-section .a-spacing-none").children("div").children("img").attr("src");
    order_details_object.payment = order_payment_object;

    order_summary_object = {};
    order_summary_object.currency = $(".a-column.a-span5.a-text-right.a-span-last").first().children().first().text().replaceAll(" ", "").replaceAll("\n", "")[0];
    order_summary_object.items_ht = parseFloat($("#od-subtotals > div:nth-child(2) > div.a-column.a-span5.a-text-right.a-span-last > span").text().replaceAll(" ", "").replaceAll("\n", "").substring(1).replace(",", "."));
    order_summary_object.shipping_ht = parseFloat($("#od-subtotals > div:nth-child(3) > div.a-column.a-span5.a-text-right.a-span-last > span").text().replaceAll(" ", "").replaceAll("\n", "").substring(1).replace(",", "."));
    order_summary_object.total_ht = parseFloat($("#od-subtotals > div:nth-child(5) > div.a-column.a-span5.a-text-right.a-span-last > span").text().replaceAll(" ", "").replaceAll("\n", "").substring(1).replace(",", "."));
    order_summary_object.tva = parseFloat($("#od-subtotals > div:nth-child(6) > div.a-column.a-span5.a-text-right.a-span-last > span").text().replaceAll(" ", "").replaceAll("\n", "").substring(1).replace(",", "."));
    order_summary_object.total_ttc = parseFloat($("#od-subtotals > div:nth-last-child(-n + 1) > div.a-column.a-span5.a-text-right.a-span-last > span").text().replaceAll(" ", "").replaceAll("\n", "").substring(1).replace(",", "."));
    order_details_object.summary = order_summary_object;

    order_transactions_array = [];
    order_transactions = $(".a-expander-content.a-expander-inline-content.a-expander-inner > div.a-row > span:not(.a-color-secondary)");
    order_transactions.each(function(i, el) {
        order_transaction_object = {};
        order_transaction_object.date = el.children[0].data.replaceAll("\n", "").split("-")[0].trim();
        order_transaction_object.amount = parseFloat(el.children[0].data.replaceAll("\n", "").replaceAll(" ", "").split(":")[1].substring(1).replace(",", "."));
        order_transaction_object.currency = el.children[0].data.replaceAll("\n", "").replaceAll(" ", "").split(":")[1].substring(0)[0];
        order_transaction_object.card_type = el.children[0].data.split("-")[1].trim().split(" ")[0];
        order_transaction_object.card_number = parseInt(el.children[0].data.split(":")[0].slice(-4));
        order_transactions_array.push(order_transaction_object);
    });
    order_details_object.transactions = order_transactions_array;

    order_billing_array = [];
    order_invoices = $(".a-unordered-list.a-vertical.a-nowrap > li > span > a[href$='.pdf']");
    order_invoices.each(function(i, el) {
        order_invoice_object = {};
        order_invoice_object.name = el.children[0].data.replaceAll("\n", "").trim();
        order_invoice_object.link = process.env.AMAZON_BASE_URL + "/" + (el.attribs.href.slice(1));
        order_billing_array.push(order_invoice_object);
    });
    order_details_object.billing = order_billing_array;

    return order_details_object;
}

module.exports = {
    parse_commandes: parse_commandes,
    parse_commandes_details: parse_commandes_details,
    parse_tracking_infos: parse_tracking_infos,
    commandes_get_number_pages: commandes_get_number_pages,
};