import React from "react";
import { Link } from "react-router-dom";
import { Music2, BarChart2 } from "lucide-react";


function UserHome() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Your Music Hub</h1>
      <div className="nav-links">
        <Link to="/user-fetch-audio" className="nav-link">
          <Music2 size={24} />
          <span>Stream Music</span>
        </Link>
        <Link to="/user-dashboard" className="nav-link">
          <BarChart2 size={24} />
          <span>Your Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default UserHome;