import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Button } from './Elements.js'
import Notification from './Notification.js';
import Menu from './Menu.js';
import NotificationItem from "./NotificationItem.js";
import { Link } from "react-router-dom";
const fetchUserData = createAsyncThunk("user/fetchUser", async (id) => {
    return await (await fetch("/api/user")).json();
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
    const notifications = useSelector(state => state.notifications);
    const dispatch = useDispatch();
    async function fetchNotifs(){
        const notifs = await (await fetch("/api/get_notifications")).json();
        dispatch({type:"LOAD_NOTIFS", notifs});
    }
    setInterval(fetchNotifs, 5000);
    function buildNotif(data){
        return <NotificationItem key={data.id} text={data.text} link={data.link}/>
    }
    useEffect(() => {
        dispatch(fetchUserData());
        fetchNotifs();
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
                <div className="m-3 h-12 w-12 rounded-full bg-center bg-cover" onClick={navMenu} style={{ backgroundImage:`url('${user.image}')` }}></div>
                <Link to={"/profile/" + user.name}><div className="m-5 m-left:10 text-accent-1 text-xl font-black">{user.name}</div></Link>
            </div>
            <Menu name="notifications" style={{ transform: "translate(-50%)" }}>
            {notifications.list.map(notification=>buildNotif(notification))}
            </Menu>
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