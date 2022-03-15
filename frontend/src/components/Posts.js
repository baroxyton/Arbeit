import React from "react-dom"
import { useEffect,} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Post from './Post.js'
import { createAsyncThunk } from '@reduxjs/toolkit'
const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  return await (await fetch("/fakeapi/posts")).json();
});
function generatePosts(data) {
  return data.map(post => {
    return (
      <Post postid={post.id} key={post.id}></Post>
      )
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
    if (posts.state == "pending") {
      // Lädt..
    }
    if (posts.state == "fulfilled") {
     // Success !
    }
  }, [posts.state, dispatch])
  return (<div className="w-4/5 ml-auto mr-auto" id="postcontainer">
    {generatePosts(posts.list)};
  </div>);
}
export default Posts;