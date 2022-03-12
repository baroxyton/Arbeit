import { connect, useDispatch, useSelector} from 'react-redux';
function Post(props) {
    let post = useSelector(state => state.posts.list.find(post=>post.id==props.postid));
    return (<div className="w-full bg-primary rounded-xl mt-3 p-3 shadow-md">
        <div className="float-left rounded-full h-12 mr-2 w-12 bg-center bg-no-repeat bg-contain shadow-sm" style={{ backgroundImage: `url("${post.user.image}")` }}></div>
        <div className="float-left text-sm text-accent-3">{post.user.name}</div>
        <div className="text-center text-3xl font-black text-accent-2">{post.title}</div>
        <br></br>
        <div className="text-center text-accent-1 text-md">{post.text}
        </div>
        <br></br>
        <div className="flex">
            <div style={{ "backgroundImage": "url('/images/comment.svg')" }} className="h-12 w-12 bg-center bg-auto bg-no-repeat m-3 shadow-md"></div>
            <div className="text-accent-1">{post.likes}</div>
            <div style={{ "backgroundImage": "url('/images/like.svg')" }} className="h-12 w-12 bg-center bg-cover bg-no-repeat m-3 shadow-md"></div>
            <div style={{ "backgroundImage": "url('/images/like.svg')" }} className="h-12 w-12 bg-top-left bg-cover bg-no-repeat rotate-180 m-3 shadow-md"></div>
        </div>
    </div>)
}
export default Post;