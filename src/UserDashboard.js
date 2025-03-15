import React, { useState, useEffect } from 'react';
import { Heart, History, PlayCircle } from 'lucide-react';

export default function UserDashboard() {
  const [userStats, setUserStats] = useState({
    likedSongs: 0,
    playHistory: 0,
    totalListeningTime: 0
  });

  useEffect(() => {
    // Fetch user stats here
    // This is a placeholder for demonstration
    setUserStats({
      likedSongs: 45,
      playHistory: 120,
      totalListeningTime: 360
    });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Music Stats</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <Heart size={32} />
          <h3>Liked Songs</h3>
          <div className="stat-value">{userStats.likedSongs}</div>
        </div>
        
        <div className="stat-card">
          <History size={32} />
          <h3>Play History</h3>
          <div className="stat-value">{userStats.playHistory}</div>
        </div>
        
        <div className="stat-card">
          <PlayCircle size={32} />
          <h3>Listening Time</h3>
          <div className="stat-value">{Math.round(userStats.totalListeningTime / 60)}h</div>
        </div>
      </div>
    </div>
  );
}