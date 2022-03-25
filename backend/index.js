const express = require("express");
const path = require("path");
const app = express();
app.use(express.json())
const api = require("./api.js");
app.all("/api/:endpoint/:endpoint2?/:endpoint3?", api);
app.use("/", [function (req, res, next) {
    serveLogin(req, res);
}, express.static(__dirname + "/../frontend/build/")]);

function serveLogin(req, res) {
    let file = req.path;
    switch (file) {
        case "/":
        case "/index.html":
            res.sendFile(path.resolve(__dirname + "/../login/index.html"));
            break;
        case "/index.css":
            res.sendFile(path.resolve(__dirname + "/../login/index.css"));
            break;
        case "/index.js":
            res.sendFile(path.resolve(__dirname + "/../login/index.js"));
            break;
        case "/signup":
            res.sendFile(path.resolve(__dirname + "/../login/signup/index.html"));
            break;
        case "/signup/index.css":
            res.sendFile(path.resolve(__dirname + "/../login/signup/index.css"));
            break;
        case "/signup/index.js":
            res.sendFile(path.resolve(__dirname + "/../login/signup/index.js"));
            break;
        default:
            res.redirect("/");
            break;
    }
}

app.listen(8080)