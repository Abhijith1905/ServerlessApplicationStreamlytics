import React, { useEffect, useState, useRef } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import userPool from './cognitoConfig';
import UserNavbar from './UserNavbar';

const API_URLS = {
  getRecommendations: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/recommend-songs",
  getLikedSongs: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/get-liked-songs",
  songPlay: "https://4qhvt7z72a.execute-api.us-east-1.amazonaws.com/dev/song-play",
  likeSong: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/like-song",
};

function RecommendedSongs() {
  const [recommendations, setRecommendations] = useState([]);
  const [likedSongs, setLikedSongs] = useState({});
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRefs = useRef({});
  const playStartTimes = useRef({});

  useEffect(() => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.getSession((err, session) => {
        if (!err) setUsername(session.getIdToken().payload['cognito:username']);
      });
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchRecommendations = async () => {
      try {
        const response = await fetch(API_URLS.getRecommendations, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: username })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch recommendations');
        }

        setRecommendations(data);
        setError('');
      } catch (error) {
        setError(error.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [username]);

  const handlePlay = async (songId) => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio && audio.id !== songId) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const playId = uuidv4();
    playStartTimes.current[songId] = Date.now();

    try {
      await fetch(API_URLS.songPlay, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, username, action: 'start', playId })
      });
    } catch (error) {
      console.error('Error tracking play:', error);
    }
  };

  const handlePauseEnd = async (songId) => {
    const duration = Math.floor((Date.now() - playStartTimes.current[songId]) / 1000);

    try {
      await fetch(API_URLS.songPlay, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, username, action: 'end', duration })
      });
    } catch (error) {
      console.error('Error tracking end:', error);
    }
  };

  const handleLike = async (songId) => {
    const isLiked = likedSongs[songId];

    try {
      await fetch(API_URLS.likeSong, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, username, action: isLiked ? 'unlike' : 'like' })
      });

      setLikedSongs(prev => ({ ...prev, [songId]: !isLiked }));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="audio-container">
        <div className="content-wrapper">
          <div className="header">
            <h1  className="app-title">Recommended Songs</h1>
            {error && <div className="error-message">{error}</div>}
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="songs-grid">
              {recommendations.map(song => (
                <div key={song.songId} className="song-card">
                  <div className="song-info">
                    <h3>{song.songName}</h3>
                    <button
                      onClick={() => handleLike(song.songId)}
                      className={`like-button ${likedSongs[song.songId] ? "active" : ""}`}
                    >
                      {likedSongs[song.songId] ? <Heart /> : <HeartOff />}
                    </button>
                  </div>
                  <audio
                    ref={el => audioRefs.current[song.songId] = el}
                    controls
                    onPlay={() => handlePlay(song.songId)}
                    onPause={() => handlePauseEnd(song.songId)}
                    onEnded={() => handlePauseEnd(song.songId)}
                  >
                    <source src={song.url} type="audio/mpeg" />
                  </audio>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecommendedSongs;