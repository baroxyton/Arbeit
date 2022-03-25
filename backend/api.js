const usernameRegex = /^[a-zA-Z]([a-zA-Z\-_0-9]){1,20}$/;
function api(req, res) {
    function sendJSON(json) {
        res.send(JSON.stringify(json));
    }
    const param1 = req.params.endpoint;
    const param2 = req.params.endpoint2;
    const param3 = req.params.endpoint3;
    let status = true;
    switch (param1) {
        case "signup":
            console.log(req.body)
            const { username, passwort } = req.body;
            if (!username || !passwort) {
                sendJSON({
                    status: "error",
                    error: "Kein Nutzername oder Passwort!"
                })
            }
            break;
    }
}
module.exports = api;