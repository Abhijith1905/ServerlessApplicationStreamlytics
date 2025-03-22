import React from "react";
import { Link } from "react-router-dom";
import { Home,Heart,Sparkles , Music2, BarChart2 } from "lucide-react";

function UserNavbar() {
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
      <div style={{ display: "flex", gap: "20px", marginLeft: "300px" }}>
        <Link to="/user-home" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Home size={20} /> Home
        </Link>
        <Link to="/user-fetch-audio" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Music2 size={20} /> Stream Audio
        </Link>
        <Link to="/user-favourites" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Heart size={20} /> Favorites
        </Link>
        <Link to="/user-recommendations" style={{ color: "#BB86FC", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <Sparkles size={20} /> Recommended Songs
        </Link>
       
      </div>
    </nav>
  );
}

export default UserNavbar;
