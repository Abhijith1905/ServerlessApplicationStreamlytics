import React, { useEffect, useState, useRef } from "react";
import { Heart, HeartOff, Music2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import userPool from "./cognitoConfig";
import UserNavbar from './UserNavbar';


const API_URLS = {
  fetchAudio: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/fetch-audio",
  getLikedSongs: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/get-liked-songs",
  songPlay: "https://4qhvt7z72a.execute-api.us-east-1.amazonaws.com/dev/song-play",
  likeSong: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/like-song",
  unlikeSong: "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/unlike-song",
};

function RecommendedSongs() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [likedSongs, setLikedSongs] = useState({});
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRefs = useRef({});
  const startTimes = useRef({});
  const audioElementRefs = useRef({});

  useEffect(() => {
    const fetchUsername = () => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            setError("Failed to fetch user session.");
            return;
          }
          setUsername(session.getIdToken().payload["cognito:username"]);
        });
      } else {
        setError("No user session found.");
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`${API_URLS.getLikedSongs}?username=${username}`);
        if (!response.ok) throw new Error("Failed to fetch liked songs");

        const rawData = await response.json();
        const data = typeof rawData.body === "string" ? JSON.parse(rawData.body) : rawData.body;
        
        setLikedSongs(data.reduce((acc, item) => ({ ...acc, [item.songId]: true }), {}));
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, [username]);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch(API_URLS.fetchAudio);
        if (!response.ok) throw new Error("Failed to fetch audio");
        const allSongs = await response.json();
        
        // Shuffle and pick 15 random songs
        const shuffled = allSongs.sort(() => Math.random() - 0.5);
        setAudioFiles(shuffled.slice(0, 15));
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudioFiles();
  }, []);

  // Rest of the code remains the same as original...

  return (
    <div>
      <UserNavbar />
      <div className="audio-container">
        <div className="content-wrapper">
          <div className="header">
            <h1 className="app-title">Recommended Songs</h1>  {/* Changed heading */}
            {error && <div className="error-message">{error}</div>}
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ): audioFiles.length === 0 ? (
            <div className="empty-state">
              <Music2 size={64} />
              <p>No audio files available.</p>
            </div>
          ) : (
            <div className="songs-grid">
              {audioFiles.map((audio) => (
                <div key={audio.songId} className="song-card">
                  <div className="song-info">
                    <h3>{audio.songName}</h3>
                    <button
                      onClick={() => handleLike(audio.songId, audio.songName)}
                      className={`like-button ${likedSongs[audio.songId] ? "active" : ""}`}
                    >
                      {likedSongs[audio.songId] ? <Heart /> : <HeartOff />}
                    </button>
                  </div>
                  <audio
                    ref={(el) => (audioElementRefs.current[audio.songId] = el)}
                    controls
                    onPlay={() => handlePlay(audio.songId, audio.songName)}
                    onPause={() => handlePauseOrEnd(audio.songId)}
                    onEnded={() => handlePauseOrEnd(audio.songId)}
                  >
                    <source src={audio.url} type={audio.contentType} />
                    Your browser does not support audio playback.
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