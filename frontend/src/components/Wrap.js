import PreviousMap from 'postcss/lib/previous-map';
import Nav from './Nav.js';
function Wrap(props) {
    return (
        <div className="h-screen w-screen bg-secondary">

            <div style={{height: "calc(100vh - 5rem)"}} className="w-full absolute top-20 overflow-y-auto">
                {props.children}
            </div>
            <Nav />
        </div >
    )
}
export default Wrap;