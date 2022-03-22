function Menu(props) {
    function hide(event) {
        if (event.target == document.getElementById("overlay-"+props.name)) {
            event.target.style.display = "none";
        }
    }
    return (
        <div id={"overlay-" + props.name} className="fixed top-0 left-0 h-screen w-screen z-50 hidden" onClick={hide}>
            <div id={"menu-" + props.name} className="absolute bg-primary h-52 shadow-2xl rounded-xl m-5 w-64" {...props}>
                {props.children}
            </div>
        </div>
    )
}
export default Menu;