import logo from './logo.svg';
import './App.css';
import Posts from "./components/Posts.js"
import Wrap from './components/Wrap.js';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <Wrap>
        <Router>
          <Routes>
            <Route path="/" element={<Posts/>} />
          </Routes>
        </Router>
      </Wrap>
    </div>
  );
}

export default App;