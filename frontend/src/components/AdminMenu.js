import { Button } from "./Elements.js";
import { useSelector } from "react-redux";
import { useEffect } from "react/cjs/react.production.min";
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
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Nutzername"></input>
                    <Button>Account sperren</Button>
                    <h1 className="text-accent-1 text-2xl">Account freischalten</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Nutzername"></input>
                    <Button>Account freischalten</Button>
                    <h1>Post löschen</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Post-ID"></input>
                    <Button>Post löschen</Button>
                    <h1>Kommentar Löschen</h1>
                    <input className="bg-secondary rounded-md text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Kommentar-ID"></input>
                    <Button>Kommentar löschen</Button>
                </div>
            </div>
        </div>
    )
}
export default AdminMenu;