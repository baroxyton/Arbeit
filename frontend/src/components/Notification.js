import { useSelector } from "react-redux";
import { useEffect } from "react/cjs/react.production.min";
function Notification(props){
    const notifications = useSelector(state => state.notifications);
    useEffect(() => {
        (async function(){
        const notif_count = await (await fetch("/api/unread_notification_count")).text();
        document.getElementById("notificationIcon").style.backgroundImage = `url('/api/notifimage_generator/${notif_count}')`;
        })()
    }, [notifications]);
    return (<div id="notificationIcon" className="h-14 w-14 bg-center bg-cover m-3" {...props}>

    </div>)
}
export default Notification;