import { connect, useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react"
function Post(props) {
    let post = useSelector(state => state.posts.list.find(post => post.id == props.postid));
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

    return (<div className="w-full bg-primary rounded-xl mt-3 p-3 shadow-md">
        <div className="float-left rounded-full h-12 mr-2 w-12 bg-center bg-no-repeat bg-contain shadow-sm" style={{ backgroundImage: `url("${post.user.image}")` }}></div>
        <div className="float-left text-sm text-accent-3">{post.user.name}</div>
        <div className="text-center text-3xl font-black text-accent-2">{post.title}</div>
        <br></br>
        <div className="text-center text-accent-1 text-md">{post.text}
        </div>
        <br></br>
        <div className="flex">
            <div className="" style={{ "backgroundImage": "url('/images/comment.svg')" }} className="h-12 w-12 bg-center bg-auto bg-no-repeat m-3"></div>
            <div className="mt-auto mb-auto text-accent-1">{post.comments}</div>
            <div style={{ "backgroundImage": `url('${like_image}')` }} className="h-12 w-12 bg-center bg-cover bg-no-repeat m-3"></div>
            <div className="mt-auto mb-auto text-accent-1">{post.likes}</div>
            <div style={{ "backgroundImage": `url('${dislike_image}')` }} className="h-12 w-12 bg-top-left bg-cover bg-no-repeat rotate-180 m-3"></div>
            <div className="mt-auto mb-auto text-accent-1">{post.dislikes}</div>
        </div>
    </div>)
}
export default Post;