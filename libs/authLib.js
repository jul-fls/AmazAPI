var otpLib = require('./otpLib');
const puppeteer = require('puppeteer');
var fs = require('fs');
async function login_amazon() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/chromium'
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: parseInt(1920),
        height: parseInt(1080),
    });
    console.log("Loading page...");
    await page.goto(process.env.AMAZON_BASE_URL + "/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.fr%2F%3Fref_%3Dnav_ya_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=frflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&", { 'timeout': 10000, 'waitUntil': 'networkidle0' });
    await page.waitForSelector('#ap_email');
    console.log("Typing email...");
    await page.type('#ap_email', process.env.AMAZON_EMAIL);
    await page.click('#continue');
    console.log("Typing password...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.type('#ap_password', Buffer.from(process.env.AMAZON_PASSWORD, 'base64').toString('ascii'));
    await page.click('#signInSubmit');
    console.log("Waiting for OTP...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    // if page contains selector #auth-mfa-otpcode
    // then 2FA is enabled
    if (await page.$('#auth-mfa-otpcode') !== null) {
        console.log("2FA is enabled");
        await page.waitForSelector('#auth-mfa-otpcode');
        await page.type('#auth-mfa-otpcode', otpLib.get_otp_code(process.env.AMAZON_OTP_SECRET));
        await page.click('#auth-signin-button');
        console.log("Waiting for OTP...");
    }
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const cookies = await page.cookies();
    const cookiesString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    process.env.AMAZON_COOKIES = cookiesString;
    await browser.close();
    //save cookies to file
    fs.writeFile("cookies.txt", cookiesString, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The cookie file was saved!");
        return true;
    });
}
module.exports = {
    login_amazon: login_amazon
};