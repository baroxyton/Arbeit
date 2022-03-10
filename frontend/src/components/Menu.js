function hide(event) {
    if (  event.target == document.querySelector(".notificationOverlay")) {
        document.querySelector(".notificationOverlay").style.display="none";
    }
}
function Menu(props) {
    return (
        <div id={"menu-"+props.name} className="fixed top-0 left-0 h-screen w-screen notificationOverlay z-50 hidden" onClick={hide}>
            <div className="absolute bg-primary h-52 shadow-2xl rounded-xl m-5 w-64" {...props}>
                {props.children}
            </div>
        </div>
    )
}
export default Menu;