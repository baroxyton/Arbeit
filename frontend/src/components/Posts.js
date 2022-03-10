import React, {useEffect,} from 'react';
import { connect, useDispatch, useSelector} from 'react-redux';
import Post from './Post.js'
import { createAsyncThunk} from '@reduxjs/toolkit'
const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  return await (await fetch("/api/posts")).text();
});

function Posts(props) {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.posts);
  useEffect(() => {
    console.log(posts, "useEffect");
    if (posts.state == "idle") {
      dispatch(fetchPosts())
    }
    if(posts.state =="pending"){
      // Lädt..
    }
    if(posts.state == "fulfilled"){
      alert("done")
    }
  }, [posts.state, dispatch])
  return (<div className="w-4/5 ml-auto mr-auto">
    <Post title="hello, world" text="Lorem ipsum" user={{name:"User 1", image:"/images/default-profile.svg"}}></Post>
    <br></br>
    <Post title="hello, world" text="Lorem ipsum" user={{name:"Test-User",image:"/images/default-profile.svg"}}></Post>
  </div>);
}
const mapStateToProps = state => {
  return {
    posts: state.posts
  };
};

export default connect(mapStateToProps)(Posts);