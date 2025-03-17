import React, { useState, useEffect } from 'react';
import { Music2, Users, Heart, PlayCircle } from 'lucide-react';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalPlays: 0
  });

  useEffect(() => {
    // Fetch dashboard stats here
    setStats({
      totalSongs: 150,
      totalUsers: 1200,
      totalLikes: 3500,
      totalPlays: 25000
    });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>
     
      <div className="dashboard-chart">
        <iframe
          className="quicksight-frame"
          width="100%"
          height="720"
          src="https://us-east-1.quicksight.aws.amazon.com/sn/embed/share/accounts/715841344892/dashboards/bc76b3e2-ebca-46cb-913d-fddd7f283490?directory_alias=Abhijith-31277"
        />
      </div>
    </div>
  );
}

export default AdminDashboard;