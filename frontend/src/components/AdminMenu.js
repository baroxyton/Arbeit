import { Button } from "./Elements.js";
import { useSelector } from "react-redux";
import { useEffect } from "react/cjs/react.production.min";
async function banUser() {
    const user = document.getElementById("banUser").value;
    const json = await (await (fetch("/api/ban_user/" + user))).json();
    if (json.status == "success") {
        alert("User gebannt");
    }
    else {
        alert("User konnte nicht gebannt werden: " + json.error);
    }
}
async function unbanUser() {
    const user = document.getElementById("unbanUser").value;
    const json = await (await (fetch("/api/unban_user/" + user))).json();
    if (json.status == "success") {
        alert("User freigeschaltet");
    }
    else {
        alert("User konnte nicht freigeschaltet werden: " + json.error);
    }
}
async function deletePost() {
    const postId = document.getElementById("postId").value;
    const json = await (await (fetch("/api/delete_post_admin/" + postId))).json();
    if (json.status == "success") {
        alert("Post gelöscht");
    }
    else {
        alert("Post konnte nicht gelöscht werden: " + json.error);
    }
}
async function deleteComment() {
    const commentId = document.getElementById("commentId").value;
    const json = await (await (fetch("/api/delete_comment_admin/" + commentId))).json();
    if (json.status == "success") {
        alert("Kommentar gelöscht");
    }
    else {
        alert("Kommentar konnte nicht gelöscht werden: " + json.error);
    }
}
async function addAdmin(){
    const user = document.getElementById("addAdmin").value;
    const json = await (await (fetch("/api/add_admin/" + user))).json();
    if (json.status == "success") {
        alert("Admin hinzugefügt");
    }
    else {
        alert("Admin konnte nicht hinzugefügt werden: " + json.error);
    }
}
function AdminMenu() {
    const user = useSelector(state => state.user);
    useEffect(() => {
        if (user.name == "Loading..") {
            return;
        }
        if (!user.roles.includes("admin")) {
            window.location.href = "/";
        }
    }, [user]);
    return (
        <div className="w-full">
            <div className="w-4/5 ml-auto p-5 mr-auto mt-5 bg-primary shadow-md rounded-md grid justify-center items-center overflow-auto">
                <h1 className="text-accent-1 text-3xl text-center font-black">Admin-Menu</h1>
                <div className="grid justify-center items-center">
                    <h1 className="text-accent-1 text-2xl">Account sperren</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Nutzername" id="banUser"></input>
                    <Button onClick={banUser}>Account sperren</Button>
                    <h1 className="text-accent-1 text-2xl">Account freischalten</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Nutzername" id="unbanUser"></input>
                    <Button onClick={unbanUser}>Account freischalten</Button>
                    <h1 className="text-accent-1 text-2xl">Post löschen</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Post-ID" id="postId"></input>
                    <Button onClick={deletePost}>Post löschen</Button>
                    <h1 className="text-accent-1 text-2xl">Kommentar Löschen</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Kommentar-ID" id="commentId"></input>
                    <Button onClick={deleteComment}>Kommentar löschen</Button>
                    <h1 className="text-accent-1 text-2xl">Admin hinzufügen</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Nutzername" id="addAdmin"></input>
                    <Button onClick={addAdmin}>Admin hinzufügen</Button>
                </div>
            </div>
        </div>
    )
}
export default AdminMenu;