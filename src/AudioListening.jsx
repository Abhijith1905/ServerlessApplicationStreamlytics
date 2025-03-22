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

function AudioListening() {
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

  console.log(username)

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
        setAudioFiles(await response.json());
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudioFiles();
  }, []);

  const handlePlay = async (songId, songName) => {
    // Reset and pause all other audio elements
    Object.entries(audioElementRefs.current).forEach(([id, audioEl]) => {
      if (id !== songId && audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0; // Reset playback position
      }
    });

    if (!songId || !songName) return;

    startTimes.current[songId] = Date.now();
    const playId = uuidv4();
    audioRefs.current[songId] = { playId };

    try {
      await fetch(API_URLS.songPlay, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, username, action: "start", playId }),
      });
    } catch (err) {
      console.error("Error starting song play:", err);
    }
  };

  const handlePauseOrEnd = (songId) => {
    if (!songId || !username) return;

    const playData = audioRefs.current[songId];
    if (!playData?.playId) return;

    const duration = Math.floor((Date.now() - startTimes.current[songId]) / 1000);
    
    fetch(API_URLS.songPlay, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId, username, action: "end", playId: playData.playId, duration }),
    }).catch(err => console.error("Error tracking song play:", err));
  };

  const handleLike = async (songId, songName) => {
    if (!username) {
      console.error("Username not found.");
      return;
    }
    if (!songId || !songName) {
      console.error("Missing songId or songName.");
      return;
    }
  
    const isLiked = likedSongs[songId] || false;
    const action = isLiked ? "unlike" : "like";
    console.log(
      `${action.toUpperCase()} song: ${songId} (${songName}) by user: ${username}`
    );
  
    const requestBody = { songId, songName, username, action };
  
    try {
      const response = await fetch(
        "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/like-song",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
  
      const responseData = await response.json();
      console.log("API Response:", responseData);
  
      if (!response.ok) {
        console.error("Error response from API:", responseData);
        return;
      }
  
      setLikedSongs((prev) => ({ ...prev, [songId]: !isLiked }));
    } catch (error) {
      console.error("Error processing like/unlike:", error);
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="audio-container">
        <div className="content-wrapper">
          <div className="header">
            <h1  className="app-title">Music Stream</h1>
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

export default AudioListening;