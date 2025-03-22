import React from "react";
import { Link } from "react-router-dom";
import { Home, Upload, Music2, BarChart2, LogOut } from "lucide-react";

function AdminNavbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#121212",
        color: "#fff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "bold", color: "#FF4F8B", marginRight: "40px" }}>
        <Music2 size={24} />
        <span>Streamlytics</span>
      </div>
      <div style={{ display: "flex", gap: "20px", marginLeft: "320px" }}>
        <Link to="/admin-home" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Home size={20} /> Home
        </Link>
        <Link to="/upload-audio" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Upload size={20} /> Upload
        </Link>
        <Link to="/admin-fetch-audio" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Music2 size={20} /> Manage Audio
        </Link>
        <Link to="/admin-dashboard" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <BarChart2 size={20} /> Dashboard
        </Link>
      
      </div>
    </nav>
  );
}

export default AdminNavbar;
