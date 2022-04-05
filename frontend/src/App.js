import logo from './logo.svg';
import './App.css';
import Posts from "./components/Posts.js"
import Wrap from './components/Wrap.js';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NewPost from './components/NewPost.js';
import ViewPost from './components/ViewPost';
import Profile from './components/Profile';
import Einstellungen from './components/Einstellungen';
import AdminMenu from './components/AdminMenu';
function App() {
  return (
    <div className="App">
        <Router>
        <Wrap>
          <Routes>
            <Route path="/" element={<Posts/>} />
            <Route path="/newpost" element={<NewPost/>}></Route>
            <Route path="/post/:id" element={<ViewPost/>}></Route>
            <Route path="/profile/:user" element={<Profile/>}></Route>
            <Route path="/einstellungen" element={<Einstellungen/>}></Route>
            <Route path="/admin" element={<AdminMenu/>}></Route>
          </Routes>
          </Wrap>
        </Router>
    </div>
  );
}

export default App;