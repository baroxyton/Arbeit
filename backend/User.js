const crypto = require("crypto");
const database = require("./database.js");
function sha256(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}
function createPasswordHash(name, password) {
    return sha256(sha256(name) + sha256(password));
}
function newUser(username, password) {
    return {
        name: username,
        password: createPasswordHash(username, password),
        roles: ["user"]
    }
}
class User {
    load(data) {
        this.data = data;
    }
    loadUser(name){
        this.load(database.findUser(name));
    }
    new(username, password) {
        this.data = newUser(username, password);
        database.addUser(this.data);
    }
    updateDB() {
        database.updateUser(this.data);
    }
    checkLogin(password){
        return createPasswordHash(this.data.name, password) == this.data.password;
    }
}
module.exports = User;