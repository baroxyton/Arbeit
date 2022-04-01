const User = require("./User.js");
const crypto = require("crypto");
const Filter = require("bad-words");
const filter = new Filter();
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
// Send post without sensitive information
function frontendPostFormat(post, user) {
    console.log({ post, }, "post");
    const postUser = new User();
    postUser.loadUser(post.user);
    const isInLikes = post.likers.includes(user.data.name);
    const isInDislikse = post.dislikers.includes(user.data.name);
    let like_state = "NONE";
    isInLikes ? like_state = "LIKE" : 0;
    isInDislikse ? like_state = "DISLIKE" : 0;
    return {
        id: post.id,
        title: post.title,
        text: post.text,
        user: {
            name: postUser.data.name,
            image: postUser.data.image

        },
        likes: post.likes,
        dislikes: post.dislikes,
        like_state,
        comments: post.comments,
        date:post.date
    }
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
            if (filter.isProfane(username)) {
                sendJSON({
                    status: "error",
                    error: "Dieser Nutzername enthält obszöne Sprache"
                })
                return;
            }
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
function createPost(user, title, text) {
    return {
        id: database.postdata.length,
        title,
        text,
        user: user.data.name,
        likes: 1,
        dislikes: 0,
        likers: [user.data.name],
        dislikers: [],
        comments: 0,
        date:Date.now()
    }
}
function createComment(user, text, parentID) {
    return {
        id: database.commentData.length,
        text,
        parentID,
        user: user.data.name,
        likes: 1,
        dislikes: 0,
        likers: [user.data.name],
        dislikers: [],
        comments: 0,
        date:Date.now()
    }
}
function loggedinApi(req, res, user) {
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    switch (param1) {
        case "user": {
            const data = { image: user.data.image, name: user.data.name };
            sendJSON(data);
        }
            break;
        case "createpost": {
            const { title, text } = req.body;
            if(!text||!title){
                sendJSON({
                    status:"error",
                    error:"Titel und Post müssen Inhalt haben!"
                }
                    )
            }
            if (text.length > 500) {
                sendJSON({
                    status: "error",
                    error: "Post zu lang"
                });
                return;
            }
            if (title.length > 20) {
                sendJSON({
                    status: "error",
                    error: "Titel zu lang"
                });
                return;
            }
            const post = createPost(user, filter.clean(title), filter.clean(text));
            database.addPost(post);
            sendJSON({
                status: "success",
                location: "/post/" + post.id
            });
        }
            break;
        case "posts": {
            const page = req.query.page;
            const posts = database.postdata.map(post => frontendPostFormat(post, user));
            sendJSON(posts);
            break;
        }
        case "getpost": {
            const post = param2;
            sendJSON(frontendPostFormat(database.postdata[post], user));
        }
            break;
        case "createcomment": {
            const { text, parentID } = req.body;
            if (!database.getPost(parentID)) {
                sendJSON({
                    status: "error",
                    error: "Post nicht gefunden"
                });
            }
            if (text.length > 200) {
                sendJSON({
                    status: "error",
                    error: "Kommentar zu lang"
                });
                return;
            }
            const comment = createComment(user, filter.clean(text), parentID);
            database.addComment(comment);
            database.getPost(comment.parentID).comments++;
            database.syncPosts();
            sendJSON({ status: "success" });
            break;
        }
        case "getcomments":{
            const commentsParent = param2;
            const commentsraw = database.getPostComments(commentsParent);
            const commentsready = commentsraw.map(post => frontendPostFormat(post, user));
            sendJSON(commentsready)
        }
            break;
    }
}
module.exports = api;