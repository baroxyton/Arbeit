import { useParams } from "react-router-dom"
import { Button } from "./Elements.js"
import { useState } from "react";
import Post from "./Post.js";
import Comment from "./Comment.js";
import { useDispatch, useSelector } from "react-redux";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { useEffect } from "react";
function generateHistory(data) {
    if (!data) {
        return <div>loading...</div>
    }
    const rarray = data.map(item => {
        return item.title ? <Post postid={item.id} /> : <Comment commentid={item.id} />
    });
    return rarray;
}
function Profile() {
    const { user } = useParams();
    const dispatch = useDispatch();
    const [profileState, setState] = useState({});
    async function fetchProfile() {
        const data = await (await (await fetch("/api/getprofile/" + user)).json());
        const history = data.history;
        const bio = data.bio;
        const image = data.image;
        dispatch({ type: "LOAD_PROFILE_POSTS", posts: history.filter(item => item.title) });
        dispatch({ type: "LOAD_COMMENTS", comments: history.filter(item => !item.title) });
        setState({ history, bio, image });

    }
    useEffect(function () {
        fetchProfile();
    }, [])
    return (<div><div className="w-100 bg-primary h-32">
        <div className="float-left grid gap-y-3 grid-rows-2 grid-flow-col">
            <Button>+ Nutzer Folgen</Button>
            <Button>Mit Nutzer chatten</Button>
            <Button>Nutzer blockieren</Button>
        </div>
        <div className="absolute top-5 left-1/2 translate-x-[-50%]">
            <div style={{ "backgroundImage": `url('${profileState.image}')` }} className="h-20 w-20 rounded-full bg-center bg-cover"></div>
            <h1 className="text-xl text-accent-2">@{user}</h1>
        </div>
        <div className="float-right text-accent-1 max-w-md overflow-auto max-h-full">
            <b>Bio</b>
            <br></br>
            <a>{profileState.bio}</a>
        </div>
    </div>
    <div className="w-4/5 mr-auto ml-auto">
            {generateHistory(profileState.history)}
        </div>
    </div>)
}
export default Profile;