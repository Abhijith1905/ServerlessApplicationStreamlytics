import React from "react";
import { Link } from "react-router-dom";

function UserHome() {
  return (
    <div>
      <h1>User Home</h1>
      <Link to="/user-fetch-audio">Stream Audio</Link>
      <Link to="/user-dashboard">Dashboard</Link>
    </div>
  );
}

export default UserHome;
