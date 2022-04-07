import { useState } from 'react';
import { useEffect } from 'react/cjs/react.production.min';
import { useSelector } from "react-redux"
let viewChat;
function ChatGroup(props) {
    return (
        <div onClick={viewChat(props.chat.id)} className="bg-primary w-11/12 mt-2 pb-5 bt-5 text-accent-1 text-center ml-auto mr-auto">
            ${props.chat.owner}
        </div>
    )
}
function chatGroups(data) {
    return data.map(chat => {
        return (
            <ChatGroup key={chat.id} chat={chat} />
        )
    })
}
function YourMessage(props) {
    return (
        <div className="w-full">
            <div className="max-w-md rounded-md bg-accent-2 text-primary m-5 p-5 float-right">
                This is your message
            </div>
            <br clear="both" />
        </div>
    )
}
function OtherMessage(props) {
    return (
        <div className="w-full">
            <div className="flex items-center text-accent-3">
                <div className="m-3 h-12 w-12 rounded-full bg-center bg-cover" style={{ "backgroundImage": "url('/images/default-profile.svg')" }}></div>
                @joeMama</div>
            <div className="max-w-md rounded-md bg-secondary text-accent-2 m-5 p-5 float-left">
                This is not your message
            </div>
            <br clear="both" />
        </div>
    )
}
function buildMessage(myName, message){
    if(message.user == myName){
        return (
            <YourMessage message={message}></YourMessage>
        )
    }
    return (
        <OtherMessage message={message}></OtherMessage>
    )
}
function buildMessages(name, messages) {

}
function submitMessage() {
    const message = document.getElementById("chat-input").value;
}
function Chat() {
    const user = useSelector(state => state.user);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    viewChat = (id) => {
        const chat = chats.find(chat => chat.id === id);
        setMessages(chat.messages);
    }
    useEffect(() => {
        (async function () {
            const json = await (await fetch("/api/get_chats")).json();
            setChats(json);
        })();
    }, []);
    async function fetchMessages(chatId){
        const messages = await (await fetch("/api/chat_messages/"+chatId));
        setMessages(messages);
    }
    return (
        <div className="w-full h-full">
            <div className="h-full w-48 bg-secondary left-0 fixed shadow-xl">
                {chatGroups(chats)}
            </div>
            <div id="chat-window" className="fixed left-48 bg-primary h-full" style={{ "width": "calc(100% - 12rem)" }}>
                {buildMessages(user.name, messages)}
            </div>
            <input className="fixed right-0 m-5 text-xl bottom-0 bg-secondary text-accent-3 rounded-md p-3" style={{ "width": "calc(100% - 14rem)" }} id="chat-input"></input>
        </div>
    )
}
export default Chat;