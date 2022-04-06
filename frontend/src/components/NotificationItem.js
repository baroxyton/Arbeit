import {Link} from "react-router-dom";
function NotificationItem(props){
    return (
        <Link to={props.link}>
        <div className="w-full bg-secondary mb-2 pt-5 pb-5 text-center">
            <div className="text-accent-2">{props.text}</div>
        </div>
        </Link>
    )
}
export default NotificationItem;