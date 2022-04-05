const crypto = require("crypto");
const database = require("./database.js");
const uploadImage = require("./uploadImage.js");
function generateCookie() {
    const month = 2678400000;
    // <= 64 bytes of entropy
    const randomString = crypto.randomBytes(64).toString('hex');
    return {
        // Expire after 2 months
        expires: Date.now() + (month * 2),
        cookieValue: randomString,
        hash: sha256(randomString)
    }
}
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
        roles: ["user"],
        image: "/images/default-profile.svg",
        banned:false,
        bio: ""
    }
}
class User {
    load(data) {
        this.data = data;
    }
    loadUser(name) {
        this.load(database.findUser(name));
    }
    new(username, password) {
        this.data = newUser(username, password);
        database.addUser(this.data);
    }
    updateDB() {
        database.updateUser(this.data);
    }
    checkLogin(password) {
        return createPasswordHash(this.data.name, password) == this.data.password;
    }
    createSession() {
        const { expires, cookieValue, hash } = generateCookie(this.password);
        let store = { expires, hash, name: this.data.name };
        database.addSession(store);
        return cookieValue;
    }
    setBio(bio){
        this.data.bio = bio;
        this.updateDB();
    }
    async updateProfilePic(base64){
        try{
        const answer = await uploadImage(base64, `profile-${this.data.name}`).catch(err=>0);
        this.data.image = answer.url;
        this.updateDB();
        }
        catch(err){
            console.log(err);
        }
    }
    changePassword(password){
        this.data.password = createPasswordHash(this.data.name, password);
        this.updateDB();
    }
    deleteUser(){
        database.deleteUser(this.data.name);
        const userPosts = database.getPostsByUser(this.data.name);
        const userComments = database.getCommentsByUser(this.data.name);
        userPosts.forEach(post => database.deletePost(post.id));
        userComments.forEach(comment => database.deleteComment(comment.id));
    }
}
module.exports = User;