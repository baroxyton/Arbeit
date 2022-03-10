import { combineReducers } from "redux";
let postInitial = {
    list: [],
    state: "idle"
}
function postReducer(state = postInitial, action) {
    console.log(action, "reducer")
    switch (action.type) {
        case "posts/fetchPosts/pending":
            return { ...state, state: "pending" };
            break;
        case "posts/fetchPosts/rejected":
            alert("Fehler, Posts vom server zu laden.. bitte lade die Seite neu oder melde diesen Fehler");
            break;
        case "posts/fetchPosts/fulfilled":
            return { ...state, state: "fulfilled",list:action.payload };
            break;
        default:
            return state;
    }
}
const reducer = combineReducers({ posts: postReducer });

export default reducer;