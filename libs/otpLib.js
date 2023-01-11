var totp = require("totp-generator");

function get_otp_code(secret,digits = 6,algorith = "SHA-1",period = 30){
    secret = secret.replace(/\s/g, '');
    secret = secret.toUpperCase();
    var code = totp(secret, {digits: digits, algorithm: algorith, period: period});
    return code;
}
module.exports = {
    get_otp_code: get_otp_code
};