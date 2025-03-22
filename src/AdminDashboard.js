import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
  });

  // Fetch stats from Lambda
  useEffect(() => {
   fetch("https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/stats")
  .then((res) => res.json())
  .then((data) => {
    const statsData = JSON.parse(data.body); // Parse the inner body
    setStats({
      totalSongs: statsData.totalSongs,
      totalUsers: statsData.totalUsers,
    });
  })
  .catch((err) => console.error("Error fetching stats:", err));

  }, []);



  const downloadCsv = async () => {
    try {
      const response = await fetch(
        "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/download-users"
      );
  
      const blob = await response.blob(); // Convert response to Blob (file format)
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "StreamlyticsUsers.csv");
      document.body.appendChild(link);
      link.click();
  
      // Clean up after download
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };
  
  return (
    <div>
      <AdminNavbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="app-title">
            Admin Dashboard
            <span style={{ fontSize: "18px", color: "#888" }}>
              {" "}
              (Users: {stats.totalUsers} | Songs: {stats.totalSongs})
            </span>
          </h1>
        </div>

        <button className="download-btn" onClick={downloadCsv}>
          Download Users CSV
        </button>

        <div className="dashboard-chart">
          <iframe
            className="quicksight-frame"
            width="100%"
            height="720"
            src="https://us-east-1.quicksight.aws.amazon.com/sn/embed/share/accounts/715841344892/dashboards/bc76b3e2-ebca-46cb-913d-fddd7f283490?directory_alias=Abhijith-31277"
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
