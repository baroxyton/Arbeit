import logo from './logo.svg';
import './App.css';
import Posts from "./components/Posts.js"
import Wrap from './components/Wrap.js';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NewPost from './components/NewPost.js';
function App() {
  return (
    <div className="App">
        <Router>
        <Wrap>
          <Routes>
            <Route path="/" element={<Posts/>} />
            <Route path="/newpost" element={<NewPost/>}></Route>
          </Routes>
          </Wrap>
        </Router>
    </div>
  );
}

export default App;