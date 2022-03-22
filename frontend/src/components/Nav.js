import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Button } from './Elements.js'
import Notification from './Notification.js';
import Menu from './Menu.js';
import { Link } from "react-router-dom";
const fetchUserData = createAsyncThunk("user/fetchUser", async (id) => {
    return await (await fetch("/fakeapi/user")).json();
});
function notificationMenu(event) {
    document.getElementById("overlay-notifications").style.display = "block";
    const rect = event.target.getBoundingClientRect();
    document.getElementById("menu-notifications").style.top = "3rem";
    document.getElementById("menu-notifications").style.left = rect.left + "px";
}
function navMenu() {
    document.getElementById("overlay-navmenu").style.display = "block";
    document.getElementById("menu-navmenu").style.right = "0";
    document.getElementById("menu-navmenu").style.top = "3em";
}
function Nav() {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUserData());
    }, []);
    return (
        <div className="w-full h-20 bg-primary shadow-xl fixed overflow-auto">
            <div className="flex float-left">
                <Link to="/newpost" className="mt-auto mb-auto"><Button>Neues Posting</Button></Link>
                <Button>Suche</Button>
                <Notification onClick={notificationMenu} />
            </div>
            <div className="flex float-right">
                <Link to={"/profile/" + user.name}></Link>
                <div className="m-3 h-12 w-12 rounded-full bg-center bg-cover" onClick={navMenu} style={{ backgroundImage: "url('/images/default-profile.svg')" }}></div>
                <Link to={"/profile/" + user.name}><div className="m-5 m-left:10 text-accent-1 text-xl font-black">{user.name}</div></Link>
            </div>
            <Menu name="notifications" style={{ transform: "translate(-50%)" }}></Menu>
            <Menu name="navmenu">
                <div className="h-full w-full grid justify-center items-center">
                <Link to="/" className="text-xl text-accent-2">Startseite</Link>
                <Link to="/chats" className="text-xl text-accent-2">Chats</Link>
                <Link to="/einstellungen" className="text-xl text-accent-2">Einstellungen</Link>
                </div>
            </Menu>
        </div>
    )
}
export default Nav;