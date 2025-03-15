import React from "react";
import { Link } from "react-router-dom";
import { Upload, Music2, BarChart2 } from "lucide-react";


function AdminHome() {
  return (
    <div className="home-container">
      <h1 className="home-title">Admin Control Center</h1>
      <div className="nav-links">
        <Link to="/upload-audio" className="nav-link">
          <Upload size={24} />
          <span>Upload Audio</span>
        </Link>
        <Link to="/admin-fetch-audio" className="nav-link">
          <Music2 size={24} />
          <span>Manage Audio</span>
        </Link>
        <Link to="/admin-dashboard" className="nav-link">
          <BarChart2 size={24} />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminHome;