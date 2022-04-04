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
        date: post.date,
        parentID: post.parentID
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
function JSONToHTML(json) {
    let html = "";
    for (prop in json) {
        html += `<h1>${prop}</h1>
        <br>
        <a>${JSON.stringify(json[prop])}</a>
        <br>`;
    }
    return html;
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
        date: Date.now()
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
        date: Date.now()
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
            sendJSON({
                image: user.data.image,
                name: user.data.name,
                bio: user.data.bio
            });
        }
            break;
        case "createpost": {
            const { title, text } = req.body;
            if (!text || !title) {
                sendJSON({
                    status: "error",
                    error: "Titel und Post müssen Inhalt haben!"
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
        case "getcomments": {
            const commentsParent = param2;
            const commentsraw = database.getPostComments(commentsParent);
            const commentsready = [...commentsraw.map(post => frontendPostFormat(post, user))].reverse();
            sendJSON(commentsready)
        }
            break;
        case "like_post":
            {
                res.sendStatus(200);
                const post_id = param2;
                const post = database.getPost(post_id);
                const isDisliker = Boolean(post.dislikers.includes(user.data.name));
                const isLiker = Boolean(post.likers.includes(user.data.name));
                if (!isLiker && !isDisliker) {
                    post.likers.push(user.data.name);
                    post.likes++;
                }
                else if (isLiker) {
                    const likerIndex = post.likers.indexOf(user.data.name);
                    post.likers.splice(likerIndex, 1);
                    post.likes--;
                }
                else if (isDisliker) {
                    const dislikerIndex = post.dislikers.indexOf(user.data.name);
                    post.dislikers.splice(dislikerIndex, 1);
                    post.likers.push(user.data.name);
                    post.likes++;
                    post.dislikes--;
                }
                database.syncPosts();
            }
            break;
        case "dislike_post": {
            res.sendStatus(200);
            const post_id = param2;
            const post = database.getPost(post_id);
            const isDisliker = Boolean(post.dislikers.includes(user.data.name));
            const isLiker = Boolean(post.likers.includes(user.data.name));
            if (!isLiker && !isDisliker) {
                post.dislikers.push(user.data.name);
                post.dislikes++;
            }
            else if (isDisliker) {
                const dislikerIndex = post.dislikers.indexOf(user.data.name);
                post.dislikers.splice(dislikerIndex, 1);
                post.dislikes--;
            }
            else if (isLiker) {
                const likerIndex = post.likers.indexOf(user.data.name);
                post.likers.splice(likerIndex, 1);
                post.dislikers.push(user.data.name);
                post.dislikes++;
                post.likes--;
            }
            database.syncPosts();
        }

            break;
        case "like_comment":
            {
                res.sendStatus(200);
                const post_id = param2;
                const post = database.getComment(post_id);
                const isDisliker = Boolean(post.dislikers.includes(user.data.name));
                const isLiker = Boolean(post.likers.includes(user.data.name));
                if (!isLiker && !isDisliker) {
                    post.likers.push(user.data.name);
                    post.likes++;
                }
                else if (isLiker) {
                    const likerIndex = post.likers.indexOf(user.data.name);
                    post.likers.splice(likerIndex, 1);
                    post.likes--;
                }
                else if (isDisliker) {
                    const dislikerIndex = post.dislikers.indexOf(user.data.name);
                    post.dislikers.splice(dislikerIndex, 1);
                    post.likers.push(user.data.name);
                    post.likes++;
                    post.dislikes--;
                }
                database.syncComments();
            }
            break;
        case "dislike_comment": {
            res.sendStatus(200);
            const post_id = param2;
            const post = database.getComment(post_id);
            console.log({ post, post_id }, "comment found?")
            const isDisliker = Boolean(post.dislikers.includes(user.data.name));
            const isLiker = Boolean(post.likers.includes(user.data.name));
            if (!isLiker && !isDisliker) {
                post.dislikers.push(user.data.name);
                post.dislikes++;
            }
            else if (isDisliker) {
                const dislikerIndex = post.dislikers.indexOf(user.data.name);
                post.dislikers.splice(dislikerIndex, 1);
                post.dislikes--;
            }
            else if (isLiker) {
                const likerIndex = post.likers.indexOf(user.data.name);
                post.likers.splice(likerIndex, 1);
                post.dislikers.push(user.data.name);
                post.dislikes++;
                post.likes--;
            }
            database.syncComments();
        }

            break;
        case "getprofile": {
            const profile = param2;
            const profileuser = new User();
            profileuser.loadUser(profile);
            let history = [...(
                database.postdata.filter(post => post.user == profile)
            ),
            ...(
                database.commentData.filter(post => post.user == profile)
            )
            ];
            history.sort((a, b) => b.date - a.date); 4
            history = history.map(post => frontendPostFormat(post, user));
            sendJSON({
                name: profileuser.data.name,
                image: profileuser.data.image,
                bio: profileuser.data.bio,
                history
            })
        }
            break;
        case "setbio": {
            const { bio } = req.body;
            if (bio.length > 50 || !bio) {
                sendJSON({
                    status: "error",
                    error: "Zu lange"
                });
                return;
            }
            sendJSON({ status: "success" });
            user.setBio(bio);
        };
            break;
        case "setpicture": {
            const { picture } = req.body;
            const base64 = picture.split(",")[1];
            user.updateProfilePic(base64);
            res.sendStatus(200);

        };
            break;
        case "changepassword": {
            const { newp, old } = req.body;
            const isCorrect = user.checkLogin(old);
            if (!isCorrect) {
                sendJSON({
                    status: "error",
                    error: "Falsches Passwort"
                });
                return;
            }
            user.changePassword(newp);
            sendJSON({ status: "success" });
        }
            break;
        case "deleteuser": {
            const { password } = req.body;
            const isCorrect = user.checkLogin(password);
            if (!isCorrect) {
                sendJSON({
                    status: "error",
                    error: "Falsches Passwort"
                });
                return;
            }
            user.deleteUser();
            sendJSON({ status: "success" });
        };
            break;
        case "requestuserdata": {
            const userdata = user.data;
            const usercomments = database.getCommentsByUser(user.data.name);
            const userposts = database.getPostsByUser(user.data.name);
            const userSessions = database.getSessionsByUser(user.data.name);
            const json = { nutzer: userdata, posts: userposts, kommentare: usercomments, sitzungen: userSessions };
            res.send(JSONToHTML(json));
        }
            break;
    }
}
module.exports = api;