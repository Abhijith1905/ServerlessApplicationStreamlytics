import React, { useState, useEffect } from 'react';
import { Music2, Users, Heart, PlayCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalPlays: 0
  });

  useEffect(() => {
    // Fetch dashboard stats here
    // This is a placeholder for demonstration
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
      
      <div className="stats-grid">
        <div className="stat-card">
          <Music2 size={32} />
          <h3>Total Songs</h3>
          <div className="stat-value">{stats.totalSongs}</div>
        </div>
        
        <div className="stat-card">
          <Users size={32} />
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        
        <div className="stat-card">
          <Heart size={32} />
          <h3>Total Likes</h3>
          <div className="stat-value">{stats.totalLikes}</div>
        </div>
        
        <div className="stat-card">
          <PlayCircle size={32} />
          <h3>Total Plays</h3>
          <div className="stat-value">{stats.totalPlays}</div>
        </div>
      </div>
    </div>
  );
}