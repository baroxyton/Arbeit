import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { createAsyncThunk } from '@reduxjs/toolkit'
import Post from "./Post.js";
import Comment from "./Comment.js"
import { Button } from "./Elements.js"
const fetchPost = createAsyncThunk("posts/fetchPost", async (id) => {
    return await (await fetch("/fakeapi/getpost/" + id)).json();
});
const fetchComments = createAsyncThunk("comments/fetchComments", async (id) => {
    return { comments: await (await fetch("/fakeapi/getcomments/" + id)).json(), id };
});
async function comment(data, dispatch) {
    const text = document.getElementById("commentArea").value;
    document.getElementById("commentArea").value = "";
    const json = await (await fetch("/fakeapi/createcomment")).json();
    if (json.status == "error") {
        alert(json.error);
        return;
    }
    dispatch({ type: "POST_COMMENT", data: { ...data, id: json.id, text } });
}
function generateSubmitComment(data, dispatch) {
    return function () {
        comment(data, dispatch);
    }
}
function generateTest() {
    return function () {
        alert(1);
    }
}

function ViewPost(props) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const posts = useSelector(state => state.posts);
    const comments = useSelector(state => state.currentComments);
    const postId = useParams().id;
    const post = posts.list.find(post => post.id == postId);
    function getComments() {
        if (comments.state == "idle" || comments.state == "pending") {
            return (<div>loading..</div>)
        };
        return comments.list.map(comment => (<Comment commentid={comment.id}></Comment>))
    }
    function getPost() {
        if (!post) {
            return (<div>Loading..</div>)
        }
        return (<Post postid={postId}></Post>)
    }
    useEffect(function () {
        if (comments.state == "idle" || comments.id != postId) {
            dispatch(fetchComments(postId))
        }
        if (comments.state == "fulfilled") {
        }
        if (!post) {
            dispatch(fetchPost(postId));
        }
    }, [posts]);
    return (
        <div>
            <div className="w-4/5 ml-auto mr-auto">
                {getPost()}
                <div className="text-primary">{post?.comments} Kommentare</div>
                <div className="bg-primary inline-block p-3">
                    <textarea id="commentArea" maxLength="200" cols="50" className="bg-secondary text-accent-1 m-5 resize-none"></textarea>
                    <br></br>
                    <Button onClick={generateSubmitComment({
                        user,
                        likes: 1,
                        dislikes: 0,
                        like_state: "LIKE"
                    }, dispatch)}>Kommentieren</Button>
                </div>
                {getComments()}
            </div>
        </div>
    )
}
export default ViewPost;