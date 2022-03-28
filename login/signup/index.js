async function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const passwordRepeat = document.getElementById("passwordRepeat").value;
    if (!username) {
        showError("Nutzername wird benötigt!");
        return;
    }
    if (password != passwordRepeat) {
        showError("Erstes Passwort entspricht dem zweiten nicht!");
        return;
    }
    if (!password) {
        showError("Passwort wird benötigt!");
        return;
    }
    const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    });
    const json = await response.json();
    if(json.status == "error"){
        showError(json.error);
    }
}
function showError(error) {
    document.getElementById("userinput").style.display = "none";
    document.getElementById("error").style.display = "grid";
    document.getElementById("errormessage").innerText = "Fehler: " + error;
}
function hideError() {
    document.getElementById("userinput").style.display = "grid";
    document.getElementById("error").style.display = "none";
}
document.getElementById("submitButton").onclick = signup;
document.getElementById("hideerror").onclick = hideError;