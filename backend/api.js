const User = require("./User.js");
const crypto = require("crypto");
const database = require("./database.js");
const svgCaptcha = require('svg-captcha');
let captchas = [];
const usernameRegex = /^[a-zA-Z]([a-zA-Z\-_0-9]){1,20}$/;
const charRegex = /[a-zA-Z\-_0-9]/;
function checkCaptcha(id, answer) {
    if (!answer || id === undefined) {
        return false;
    }
    const captcha = captchas[Number(id)].toLowerCase();
    const isCorrect = captcha == answer.toLowerCase();
    if (isCorrect) {
        captchas.splice(id, null);
    }
    return isCorrect;
}
function findUserLogin(loginCookie) {
    if (!loginCookie) {
        return false;
    }
    const sessionHash = crypto.createHash("sha256").update(loginCookie).digest("hex");
    const session = database.findSession(sessionHash);
    if (!session) {
        return;
    }
    if (session.expire < Date.now()) {
        return;
    }
    return session;
}
function api(req, res) {
    const loginCookie = req.cookies.login;
    const account = findUserLogin(loginCookie);
    if (!account) {
        loggedoutApi(req, res);
        return;
    }
    const user = new User();
    user.loadUser(account.name);
    loggedinApi(req, res, user);
}

function loggedoutApi(req, res) {
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    switch (param1) {
        case "generateCaptcha": {
            const captchaIndex = captchas.length;
            const captchaSVG = svgCaptcha.create({ ignoreChars: "0o1iIl" });
            captchas.push(captchaSVG.text);
            res.setHeader("content-type", "application/json")
            sendJSON({
                image: captchaSVG.data,
                index: captchaIndex
            });
            break;
        }
        case "signup": {
            const { username, password, captchaAnswer, captchaId } = req.body;
            if (!checkCaptcha(captchaId, captchaAnswer)) {
                sendJSON({
                    status: "error",
                    error: "Verifizierung: falsche Antwort. Bitte versuche es erneut"
                });
                return;
            }
            if (!username || !password) {
                sendJSON({
                    status: "error",
                    error: "Kein Nutzername oder Passwort!"
                });
                return;
            }
            if (username.length > 21) {
                sendJSON({
                    status: "error",
                    error: "Nutzername zu lang! Die länge sollte zwischen 2 und 21 liegen."
                });
                return;
            }
            if (username.length < 2) {
                sendJSON({
                    status: "error",
                    error: "Nutzername zu kurz! Die länge sollte zwischen 2 und 21 liegen."
                });
                return;
            }
            if (!username.match(usernameRegex)) {
                const disallowedChar = username.split("").find(char => !char.match(charRegex));
                sendJSON({
                    status: "error",
                    error: `Nutzername enthält unerlaubtes Zeichen: "${disallowedChar || "Am anfang"}". Bitte verwenden Sie nur Buchstaben, Zahlen, _ und -. Das erste Zeichen muss ein Buchstabe sein`
                });
                return;
            }
            if (database.findUser(username)) {
                sendJSON({
                    status: "error",
                    error: "Nutzername bereits besetzt - bitte wähle einen anderen"
                });
                return;
            }
            // signup check successfull
            let newUser = new User();
            newUser.new(username, password);
            const session = newUser.createSession();
            sendJSON({
                status: "success",
                session
            });
            break;
        }
        case "login": {
            const { username, password } = req.body;
            console.log(req.body, "login");
            if (!username || !password) {
                sendJSON({
                    status: "error",
                    error: "Kein Nutzername oder Passwort!"
                });
                return;
            }
            if (!database.findUser(username)) {
                sendJSON({
                    status: "error",
                    error: "Nutzer existiert nicht!"
                });
                return;
            }
            // Valid username - check for password
            let user = new User();
            user.loadUser(username);
            const isCorrect = user.checkLogin(password);
            if (!isCorrect) {
                sendJSON({
                    status: "error",
                    error: "Falsches passwort"
                });
                return;
            }
            // Successful login
            const session = user.createSession();

            sendJSON({
                status: "success",
                session
            });
        }
    }
}
function loggedinApi(req, res, user) {
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    res.send("welcome, " + user.data.name);
}
module.exports = api;