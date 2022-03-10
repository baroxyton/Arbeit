import React from "react-dom";
import {Button} from './Elements.js'
import Notification from './Notification.js';
import Menu from './Menu.js';
function notificationMenu(event){
    document.getElementById("menu-notifications").style.display = "block";
    const rect = event.target.getBoundingClientRect();
    document.getElementById("menu-notifications").style.top = "3rem";
    document.getElementById("menu-notifications").style.left = rect.left + "px";
}
function Nav(){
    return (
<div className="w-full h-20 bg-primary shadow-xl fixed overflow-auto">
    <div className="flex float-left">
    <Button>Neues Posting</Button>
    <Button>Suche</Button>
    <Notification onClick={notificationMenu}/>
    </div>
    <div className="flex float-right">
    <div className="m-3 h-12 w-12 rounded-full bg-center bg-cover" style={{backgroundImage:"url('/images/default-profile.svg')"}}></div>
    <div className="m-5 m-left:10 text-accent-1 text-xl font-black">Nutzername</div>
    </div>
    <Menu name="notifications" style={{transform:"translate(-50%)"}}></Menu>
</div>
    )
}
export default Nav;