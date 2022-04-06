import { combineReducers } from "redux";
let postInitial = {
    list: [],
    state: "idle",
    id: "none"
}
let commentInitial = {
    list: [],
    state: "idle"
}
let userInitial = {
    image: "/images/default-profile.svg",
    name: "Loading..",
    bio: "Loading..",
    roles: []
}
let notificationInitial = {
    list: []
}
function notificationReducer(state = notificationInitial, action) {
    const stateClone = JSON.parse(JSON.stringify(state));
    switch (action.type) {
        case "LOAD_NOTIFS":
            stateClone.list = action.notifs;
            return stateClone;
            break;
        default:
            return state;
    }
}
function userReducer(state = userInitial, action) {
    switch (action.type) {
        case "user/fetchUser/fulfilled":
            return action.payload;
        case "SETBIO":
            return { ...state, bio: action.bio };
            break;
        case "SETPROFILE":
            return { ...state, image: action.profile };
            break;
        default:
            return state;
    }
}
function commentReducer(state = commentInitial, action) {
    let stateClone = JSON.parse(JSON.stringify(state));
    let id, post, postIndex;
    switch (action.type) {
        case "LOAD_COMMENTS":
            stateClone.list = action.comments;
            stateClone.id = -1;
            return stateClone;
            break;
        case "comments/fetchComments/pending":
            return { ...state, state: "pending" };
            break;
        case "comments/fetchComments/rejected":
            alert("Fehler, Kommentare vom server zu laden.. bitte lade die Seite neu oder melde diesen Fehler");
            break;
        case "comments/fetchComments/fulfilled":
            const postId = action.payload.id;
            const comments = action.payload.comments;
            return { ...state, state: "fulfilled", list: comments, id: postId };
        case "LIKE_COMMENT":
            id = action.id;

            postIndex = state.list.findIndex(post => post.id == id);
            post = stateClone.list[postIndex];
            switch (post.like_state) {
                case "NONE":
                    post.likes++;
                    post.like_state = "LIKE";
                    break;
                case "LIKE":
                    post.likes--;
                    post.like_state = "NONE";
                    break;
                case "DISLIKE":
                    post.likes++;
                    post.like_state = "LIKE";
                    post.dislikes--;
                    break;

            }
            return stateClone;
        case "DISLIKE_COMMENT":
            id = action.id;
            postIndex = state.list.findIndex(post => post.id == id);
            post = stateClone.list[postIndex];
            switch (post.like_state) {
                case "NONE":
                    post.dislikes++;
                    post.like_state = "DISLIKE";
                    break;
                case "DISLIKE":
                    post.dislikes--;
                    post.like_state = "NONE";
                    break;
                case "LIKE":
                    post.dislikes++;
                    post.like_state = "DISLIKE";
                    post.likes--;
                    break;
            }
            return stateClone;
        case "POST_COMMENT":
            stateClone.list.unshift(action.data);
            return stateClone;
            break;
        case "DELETE_COMMENT":
            id = action.id;
            postIndex = state.list.findIndex(post => post.id == id);
            stateClone.list.splice(postIndex, 1);
            return stateClone;
            break;
        default:
            return state;
    }
}
function postReducer(state = postInitial, action) {
    let stateClone = JSON.parse(JSON.stringify(state));
    console.log(action, "reducer");
    let post, postIndex, id;
    switch (action.type) {
        case "LOAD_PROFILE_POSTS":
            stateClone.state = "idle";
            stateClone.list = action.posts;
            return stateClone;
        case "posts/fetchPosts/pending":
            return { ...state, state: "pending" };
            break;
        case "posts/fetchPosts/rejected":
            alert("Fehler, Posts vom server zu laden.. bitte lade die Seite neu oder melde diesen Fehler");
            break;
        case "posts/fetchPosts/fulfilled":
            return { ...state, state: "fulfilled", list: action.payload };
        case "posts/fetchPost/fulfilled":
            let data = action.payload;
            data.hidden = true;
            stateClone.list.push(data);
            return stateClone;
            break;
        case "LIKE":
            id = action.id;

            postIndex = state.list.findIndex(post => post.id == id);
            post = stateClone.list[postIndex];
            switch (post.like_state) {
                case "NONE":
                    post.likes++;
                    post.like_state = "LIKE";
                    break;
                case "LIKE":
                    post.likes--;
                    post.like_state = "NONE";
                    break;
                case "DISLIKE":
                    post.likes++;
                    post.like_state = "LIKE";
                    post.dislikes--;
                    break;

            }
            stateClone.list[postIndex] = post;
            return stateClone;

        case "DISLIKE":
            id = action.id;
            postIndex = state.list.findIndex(post => post.id == id);
            post = stateClone.list[postIndex];
            switch (post.like_state) {
                case "NONE":
                    post.dislikes++;
                    post.like_state = "DISLIKE";
                    break;
                case "DISLIKE":
                    post.dislikes--;
                    post.like_state = "NONE";
                    break;
                case "LIKE":
                    post.dislikes++;
                    post.like_state = "DISLIKE";
                    post.likes--;
                    break;
            }
            stateClone.list[postIndex] = post;
            return stateClone;
            break;
        case "DELETE_POST":
            id = action.id;
            postIndex = state.list.findIndex(post => post.id == id);
            stateClone.list.splice(postIndex, 1);
            return stateClone;
        default:
            return state;
    }
}
const reducer = combineReducers({ posts: postReducer, currentComments: commentReducer, user: userReducer, notifications: notificationReducer });

export default reducer;