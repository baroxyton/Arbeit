const JSONdb = require("simple-json-db");
let db = new JSONdb(__dirname + '/.data.json');
function initDB() {

}
if (!db.get("init")) {
    db.JSON({
        users: [],
        posts: [],
        comments: [],
        sessions: [],
        init: true
    })
    initDB();
}
class Database {
    constructor() {
        this.userdata = db.get("users");
        this.postdata = db.get("posts");
        this.commentData = db.get("comments");
        this.sessionData = db.get("sessions");
    }
    syncDB() {
        db.sync();
    }
    syncSessions() {
        db.set("sessions", this.sessionData);
        this.syncDB();
    }
    syncUsers() {
        db.set("users", this.userdata);
        this.syncDB()
    }
    syncPosts() {
        db.set("posts", this.postdata)
        this.syncDB();
    }
    syncComments() {
        db.set("comments", this.commentData);
        this.syncDB();
    }
    sync() {
        this.syncUsers();
        this.syncPosts();
        this.syncComments();
        this.syncSessions();
    }
    findUserIndex(name) {
        return this.userdata.findIndex(user => user.name == name);
    }
    findUser(name) {
        return this.userdata[this.findUserIndex(name)]
    }

    addUser(user) {
        this.userdata.push(user);
        this.syncUsers();
    }
    updateUser(user) {
        const index = this.findUserIndex(user.name);
        this.userdata.splice(index, 1, user);
        this.syncUsers();
    }
    addSession(session) {
        this.sessionData.push(session);
        this.syncSessions();
    }
    findSession(hash) {
        return this.sessionData.find(session => session.hash == hash);
    }
    addPost(post) {
        this.postdata.push(post);
        this.syncPosts();
    }
    addComment(comment) {
        this.commentData.push(comment);
        this.syncComments();
    }
    getPost(id) {
        return this.postdata.find(post => post.id == id);
    }
    getComment(id) {
        return this.commentData.find(post => post.id == id);
    }
    getPostComments(id) {
        return this.commentData.filter(comment => comment.parentID == id);
    }
    getCommentsByUser(user) {
        return this.commentData.filter(comment => comment.user == user);
    }
    deleteComment(id) {
        const index = this.commentData.findIndex(comment => comment.id == id);
        this.commentData.splice(index, 1);
        this.syncComments();
    }
    deletePost(id) {
        const index = this.postdata.findIndex(post => post.id == id);
        this.postdata.splice(index, 1);
        this.syncPosts();
        const comments = this.getPostComments(id);
        comments.forEach(comment => this.deleteComment(comment.id));
    }
    deleteUser(name){
        const index = this.userdata.findIndex(user => user.name == name);
        this.userdata.splice(index, 1);
        this.syncUsers();
        const posts = this.getPostsByUser(name);
        posts.forEach(post => this.deletePost(post.id));
        const comments = this.getCommentsByUser(name);
        comments.forEach(comment => this.deleteComment(comment.id));
        this.syncComments();
        this.syncPosts();
    }
}
const database = new Database();
module.exports = database;