var util = require('util');
var getLib = require('./libs/getLib');
var authLib = require('./libs/authLib');

async function auth() {
    authLib.login_amazon();
}
auth();