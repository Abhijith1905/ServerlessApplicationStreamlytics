import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminHome from './pages/AdminHome';
import AudioUpload from './pages/AudioUpload';
import AudioStream from './pages/AudioStream';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="nav-bar">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              Admin Dashboard
            </Link>
            <div className="nav-links">
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/stream" className="nav-link">Stream</Link>
            </div>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/upload" element={<AudioUpload />} />
            <Route path="/stream" element={<AudioStream />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;