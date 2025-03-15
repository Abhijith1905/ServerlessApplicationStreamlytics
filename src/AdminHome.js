import React from "react";
import { Link } from "react-router-dom";

function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <Link to="/upload-audio">Upload Audio</Link>
      <br />
      <Link to="/admin-fetch-audio">Stream Audio</Link>
      <br/>
       <Link to="/admin-dashboard">Dashboard</Link>
    </div>
  );
}

export default AdminHome;
