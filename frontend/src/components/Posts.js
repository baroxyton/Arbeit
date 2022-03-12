import React from "react-dom"
import {useEffect} from 'react';
import store from "../redux/store.js";
import { Provider, useDispatch, useSelector} from 'react-redux';
import Post from './Post.js'
import { createAsyncThunk} from '@reduxjs/toolkit'
const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  return await (await fetch("/fakeapi/posts")).json();
});
function generatePosts(data){
  return data.map(post=>{
    return (<Provider store={store}>
    <Post postid={post.id}></Post>
    </Provider>)
  })
}
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
      let reactPosts = generatePosts(posts.list);
      let container = document.getElementById("postcontainer")
      React.render(reactPosts, container)
    }
  }, [posts.state, dispatch])
  return (<div className="w-4/5 ml-auto mr-auto" id="postcontainer">
 Lädt..
  </div>);
}
export default Posts;