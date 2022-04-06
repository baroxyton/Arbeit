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
// Date to time difference (e.g "vor 1 Stunde")
function dateToDiff(date) {
    const currentDate = new Date().getTime();
    const msDiff = currentDate - date;
    let string = "";
    if (msDiff < 1000) {
        string = "vor einer Sekunde";
    }
    else if (msDiff < 60000) {
        string = "vor " + Math.floor(msDiff / 1000) + " Sekunden";
    }
    else if (msDiff < 3600000) {
        string = "vor " + Math.floor(msDiff / 60000) + " Minuten";
    }
    else if (msDiff < 86400000) {
        string = "vor " + Math.floor(msDiff / 3600000) + " Stunden";
    }
    else if (msDiff < 604800000) {
        string = "vor " + Math.floor(msDiff / 86400000) + " Tagen";
    }
    else if (msDiff < 2419200000) {
        string = "vor " + Math.floor(msDiff / 604800000) + " Wochen";
    }
    else if (msDiff < 31536000000) {
        string = "vor " + Math.floor(msDiff / 2419200000) + " Monaten";
    }
    else {
        string = "vor " + Math.floor(msDiff / 31536000000) + " Jahren";
    }
    return string;
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
        date: dateToDiff(post.date),
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
function createNotification(user, text, link) {
    const dbuser = new User();
    dbuser.loadUser(user);
    dbuser.data.unreadNotifications++;
    return {
        id: database.notificationData.length,
        text,
        user,
        date: Date.now(),
        link
    }
}
function pingUsers(text, link) {
    const mentions = text.match(/@[a-zA-Z]([a-zA-Z\-_0-9]){1,20}/g);
    if (!mentions) {
        return;
    }
    mentions.forEach(mention => {
        const user = new User();
        user.loadUser(mention.slice(1));
        if (user.data.name) {
            database.notificationData.push(createNotification(user.data.name, `${user.data.name} hat dich in einem Post erwähnt`, link));

        }
    });
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
// Root API
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
    if (!user.data.banned) {
        unbannedApi(req, res, user);
    }
    if (user.data.roles.includes("admin")) {
        adminApi(req, res, user);
    }
}

// API for guest
// Login, registration, captcha
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
// API for logged in users (Possibly banned)
// View anything, only change own data
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
                bio: user.data.bio,
                roles: user.data.roles
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
        case "getcomments": {
            const commentsParent = param2;
            const commentsraw = database.getPostComments(commentsParent);
            const commentsready = [...commentsraw.map(post => frontendPostFormat(post, user))].reverse();
            sendJSON(commentsready)
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
        case "delete_post": {
            const post_id = param2;
            const post = database.getPost(post_id);
            if (post.user != user.data.name) {
                sendJSON({
                    status: "error",
                    error: "Du bist nicht der Ersteller dieses Posts"
                });
                return;
            }
            database.deletePost(post_id);
            sendJSON({ status: "success" });
        }
            break;
        case "delete_comment": {
            const comment_id = param2;
            const comment = database.getComment(comment_id);
            if (comment.user != user.data.name) {
                sendJSON({
                    status: "error",
                    error: "Du bist nicht der Ersteller dieses Kommentars"
                });
                return;
            }
            database.deleteComment(comment_id);
            sendJSON({ status: "success" });
        }
            break;
        case "get_notifications":
            {
                const notifications = [...database.getNotifications(user.data.name)].slice(-10);
                sendJSON(notifications);
            }
            break;
        case "notifimage_generator":
            {
                const notification_count = param2;
                res.setHeader('Content-Type', 'image/svg+xml');
                res.send(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                    <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Capa_1" x="0px" y="0px" width="510px" height="510px" viewBox="0 0 510 510" style="enable-background:new 0 0 510 510;" xml:space="preserve" >
                    
                    <g id="g3" fill="#5C6F68" transform="matrix(0.87658593,0,0,0.87658593,31.470588,31.470588)"><g id="notifications"><path d="m 255,510 c 28.05,0 51,-22.95 51,-51 l -102,0 c 0,28.05 22.95,51 51,51 z m 165.75,-153 0,-140.25 C 420.75,137.7 367.2,73.95 293.25,56.1 l 0,-17.85 C 293.25,17.85 275.4,0 255,0 234.6,0 216.75,17.85 216.75,38.25 l 0,17.85 C 142.8,73.95 89.25,137.7 89.25,216.75 l 0,140.25 -51,51 0,25.5 433.5,0 0,-25.5 -51,-51 z" id="path6" inkscape:connector-curvature="0"/></g></g><g id="g8"/><g id="g10"/><g id="g12"/><g id="g14"/><g id="g16"/><g id="g18"/><g id="g20"/><g id="g22"/><g id="g24"/><g id="g26"/><g id="g28"/><g id="g30"/><g id="g32"/><g id="g34"/><g id="g36"/>
                    
                    <circle cx="130" cy="100" r="100" fill="#A7FFF6" />
                    <text x="140" y="130" 
                              text-anchor="middle"
                                stroke="#8AA39B"
                                fill="#8AA39B"
                                stroke-width="10px"
                                font-size="150px"
                              alignment-baseline="middle"> ${notification_count} </text>
                    </svg>`);
            }
    }
}
// Unbanned, logged in user API
// View anything, interact
function unbannedApi(req, res, user) {
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    switch (param1) {
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
            pingUsers(text, `/post/${post.id}`);
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

            const parentPost = database.getPost(comment.parentID);
            const parentPoster = parentPost.user;
            database.notificationData.push(createNotification(parentPoster,
                `${user.data.name} hat einen Kommentar auf deinem Post hinterlassen`,
                `/post/${comment.parentID}`));
            pingUsers(text, `/post/${comment.parentID}`);
            database.syncNotifications();

            sendJSON({ status: "success" });
        }
            break;
    }
}
function adminApi(req, res, user) {
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    switch (param1) {
        case "ban_user":
            {
                console.log("banning user", param2);
                const username = param2;
                const banUser = new User();
                banUser.loadUser(username);
                if (!banUser.data.name) {
                    sendJSON({
                        status: "error",
                        error: "Nutzer nicht gefunden"
                    });
                    return;
                }
                banUser.data.banned = true;
                database.syncUsers();
                sendJSON({ status: "success" });
            }
            break;
        case "unban_user":
            {
                const username = param2;
                const banUser = new User();
                banUser.loadUser(username);
                if (!banUser.data.name) {
                    sendJSON({
                        status: "error",
                        error: "Nutzer nicht gefunden"
                    });
                    return;
                }
                banUser.data.banned = false;
                database.syncUsers();
                sendJSON({ status: "success" });
            }
            break;
        case "delete_post_admin":
            {
                const post_id = param2;
                const post = database.getPost(post_id);
                if (!post) {
                    sendJSON({
                        status: "error",
                        error: "Post nicht gefunden"
                    });
                    return;
                }
                database.deletePost(post_id);
                database.syncPosts();
                sendJSON({ status: "success" });
            }
            break;
        case "delete_comment_admin":
            {
                const comment_id = param2;
                const comment = database.getComment(comment_id);
                if (!comment) {
                    sendJSON({
                        status: "error",
                        error: "Kommentar nicht gefunden"
                    });
                    return;
                }
                database.deleteComment(comment_id);
                database.syncComments();
                sendJSON({ status: "success" });
            }
            break;
        case "add_admin":
            {
                const username = param2;
                const newAdmin = new User();
                newAdmin.loadUser(username);
                if (!newAdmin.data.name) {
                    sendJSON({
                        status: "error",
                        error: "Nutzer nicht gefunden"
                    });
                    return;
                }
                newAdmin.data.roles.push("admin");
                database.syncUsers();
                sendJSON({ status: "success" });
            }
            break;
    }
}
module.exports = api;