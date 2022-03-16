import { Button } from "./Elements.js";
import { useNavigate } from 'react-router-dom';
function updateCount(event) {
    let number = event.target.value.length;
    document.querySelector("#letternumber").innerText = `Zeichen: ${number}/500`
}
function generatePost(redirect) {
    return function () {
        post(redirect);
    }
}
async function post(redirect) {
    const answer = await fetch("/fakeapi/createpost");
    const json = await answer.json();
    if (json.status == "success") {
        redirect(json.location);
        return
    }
    alert("Fehler: " + json.error)
}
function NewPost() {
    const navigate = useNavigate();
    return (
        // Wrap
        <div className="w-full">
            <div className="w-4/5 ml-auto p-5 mr-auto mt-5 bg-primary shadow-md rounded-md grid justify-center items-center overflow-auto">
                <h1 className="text-accent-1 text-3xl text-center font-black">Neuer Post</h1>
                <input maxLength="50" className="bg-secondary text-2xl text-accent-3 m-3 placeholder-accent-3 placeholder-opacity-50 p-2" placeholder="Überschrift" id="title"></input>
                <textarea onKeyUp={updateCount} maxLength="500" cols="50" rows="10" className="bg-secondary text-accent-3 placeholder-accent-3 placeholder-opacity-50 text-xl resize-none" placeholder="Inhalt" id="text"></textarea>
                <div className="text-accent-1" id="letternumber">Zeichen: 0/500</div>
                <div className="flex justify-center">
                    <Button onClick={generatePost(navigate)}>Erstellen</Button>
                </div>
            </div>
        </div>
    )
}
export default NewPost;