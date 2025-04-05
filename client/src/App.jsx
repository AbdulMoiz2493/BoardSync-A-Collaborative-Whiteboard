import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Whiteboard from './components/Whiteboard';
import WhiteboardList from './components/WhiteboardList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/whiteboards" element={<WhiteboardList />} />
        <Route path="/whiteboard/:id" element={<Whiteboard />} />
      </Routes>
    </Router>
  );
}

export default App;