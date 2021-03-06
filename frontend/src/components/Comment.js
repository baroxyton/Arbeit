import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from 'react-router-dom';
function Comment(props) {
    const user = useSelector(state => state.user);
    const navigate = useNavigate()
    const dispatch = useDispatch();
    console.log(useSelector(state => state.currentComments), "comments");
    let post = useSelector(state => state.currentComments.list.find(comment => props.commentid == comment.id));
    function commentReply() {
        const textarea = document.getElementById("commentArea");
        if (!textarea) {
            navigate("/post/" + post.parentID)
            return;
        }
        const name = post.user.name;
        textarea.value = `@${name}`;
    }
    let like_activated = "/images/like-active.svg"
    let like_deactivated = "/images/like.svg";
    let like_image = like_deactivated;
    let dislike_image = like_deactivated;
    switch (post.like_state) {
        case "LIKE":
            dislike_image = like_deactivated;
            like_image = like_activated;
            break;
        case "DISLIKE":
            dislike_image = like_activated;
            like_image = like_deactivated;
    }
    function like(event) {
        fetch("/api/like_comment/" + post.id);
        dispatch({ type: "LIKE_COMMENT", id: post.id });
    }
    function dislike(event) {
        dispatch({ type: "DISLIKE_COMMENT", id: post.id });
        fetch("/api/dislike_comment/" + post.id);
    }
    function deleteComment() {
        const confirm = window.confirm("Willst du diesen Kommentar wirklich löschen?");
        if (!confirm) {
            return;
        }
        fetch("/api/delete_comment/" + post.id);
        dispatch({ type: "DELETE_COMMENT", id: post.id });
    }
    return (<div className="w-4/5 bg-primary rounded-xl mt-3 p-3 shadow-md">
        <Link to={"/profile/" + post.user.name}><div className="float-left rounded-full h-12 mr-2 w-12 bg-center bg-no-repeat bg-cover shadow-sm cursor-pointer" style={{ backgroundImage: `url("${post.user.image}")` }}></div>
            <div className="float-left text-sm text-accent-3 cursor-pointer">{post.user.name}</div></Link>
        <br></br>
        <div className="text-center text-accent-1 text-md break-all">{post.text}</div>
        <br></br>
        <div className="flex">
            <div onClick={commentReply} style={{ "backgroundImage": "url('/images/comment-reply.svg')" }} className="h-12 w-12 bg-center bg-auto bg-no-repeat m-3"></div>
            <div className="mt-auto mb-auto text-accent-1">{post.comments}</div>
            <div onClick={like} style={{ "backgroundImage": `url('${like_image}')` }} className="h-12 w-12 bg-center bg-cover bg-no-repeat m-3 like cursor-pointer"></div>
            <div className="mt-auto mb-auto text-accent-1">{post.likes}</div>
            <div onClick={dislike} style={{ "backgroundImage": `url('${dislike_image}')` }} className="h-12 w-12 bg-top-left bg-cover bg-no-repeat rotate-180 m-3 dislike cursor-pointer"></div>
            <div className="mt-auto mb-auto text-accent-1 ">{post.dislikes}</div>
            {(
                post.user.name == user.name ? <div onClick={deleteComment} className="h-12 w-12 bg-top-left bg-contain bg-no-repeat m-3 dislike cursor-pointer" style={{ "backgroundImage": "url('/images/trash.svg')" }}></div> : ""
            )}
            <div className="self-center justify-self-end ml-auto text-accent-3">{post.date}</div>
        </div>
    </div>)
}
export default Comment;