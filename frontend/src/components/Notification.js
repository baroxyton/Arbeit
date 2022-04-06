import { useSelector } from "react-redux";
import { useEffect } from "react/cjs/react.production.min";
function Notification(props){
    const notifications = useSelector(state => state.notifications);
    useEffect(() => {
        (async function(){
        const notif_count = Number(await (await fetch("/api/unread_notification_count")).text());
        if(notif_count === 0){
            document.getElementById("notificationIcon").style.backgroundImage = "url('/images/notification-none.svg')";
            return
        }
        document.getElementById("notificationIcon").style.backgroundImage = `url('/api/notifimage_generator/${notif_count}')`;
        })()
    }, [notifications]);
    return (<div id="notificationIcon" className="h-14 w-14 bg-center bg-cover m-3" {...props}>

    </div>)
}
export default Notification;