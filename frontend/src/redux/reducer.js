import { list } from "postcss";
import { combineReducers } from "redux";
let postInitial = {
    list: [],
    state: "idle"
}
function postReducer(state = postInitial, action) {
    let stateClone = JSON.parse(JSON.stringify(state));
    console.log(action, "reducer");
    let post, postIndex, id;
    switch (action.type) {
        case "posts/fetchPosts/pending":
            return { ...state, state: "pending" };
            break;
        case "posts/fetchPosts/rejected":
            alert("Fehler, Posts vom server zu laden.. bitte lade die Seite neu oder melde diesen Fehler");
            break;
        case "posts/fetchPosts/fulfilled":
            return { ...state, state: "fulfilled", list: action.payload };
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
            break;
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
        default:
            return state;
    }
}
const reducer = combineReducers({ posts: postReducer });

export default reducer;