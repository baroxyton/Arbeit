import { Button } from "./Elements";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
async function setBio(bio, dispatch) {
    const json = await (await fetch("/api/setbio", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bio
        })
    })).json();
    if (json.status == "error") {
        alert(json.error);
        return;
    }
    dispatch({ type: "SETBIO", bio });
}
function setProfile() {

}
function generateSetBio(dispatch) {
    return () => {
        setBio(document.getElementById("bioInput").value, dispatch)
    }
}
function Einstellungen() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    useEffect(() => {
        document.getElementById("bioInput").value = user.bio;
        document.getElementById("currentProfile").style.backgroundImage = `url("${user.image}")`;

        console.log(user, "nutzerdaten");
    });
    function profileChange() {
        const file = document.getElementById("imageUpload").files[0];
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => {
            const url = fr.result;
            dispatch({ type: "SETPROFILE", profile:url });
        };
    };
    return (
        <div className="w-full">
            <div className="w-4/5 ml-auto p-5 mr-auto mt-5 bg-primary shadow-md rounded-md grid justify-center items-center overflow-auto">
                <h1 className="text-accent-1 text-3xl text-center font-black">Einstellungen</h1>
                <h1 className="text-accent-1 text-3xl text-center font-black mt-3">Bio</h1>
                <div>
                    <textarea className="resize-none bg-secondary text-accent-1 m-3" maxLength="50" id="bioInput"></textarea>
                    <br></br>
                    <Button onClick={generateSetBio(dispatch)}>Ändern</Button>
                </div>
                <h1 className="text-accent-1 text-3xl text-center font-black mt-3">Passwort</h1>
                <div>
                    <input className="bg-secondary text-accent-1 text-xl m-3 p-3  placeholder-accent-1  placeholder-opacity-50" placeholder="Altes Passwort"></input>
                    <br></br>
                    <input className="bg-secondary text-accent-1 text-xl placeholder-accent-1  placeholder-opacity-50 m-3 p-3" placeholder="Neues Passwort"></input>
                    <br></br>
                    <Button>Ändern</Button>
                    <h1 className="text-accent-1 text-3xl text-center font-black mt-3">Profilbild</h1>
                    <div>
                        <div id="currentProfile" className="m-3 h-24 w-24 rounded-full bg-center bg-cover"></div>
                        <input type="file" id="imageUpload" className="invisible" accept="image/*" onChange={profileChange}></input>
                        <label for="imageUpload">
                            <Button>Neues Profilbild hochladen</Button>
                        </label>
                    </div>
                    <h1 className="text-accent-1 text-3xl text-center font-black mt-3">Account</h1>
                    <div>
                        <Button>Account Löschen</Button>
                        <br></br>
                        <br></br>
                        <Button>Gespeicherte Daten beantragen</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Einstellungen;