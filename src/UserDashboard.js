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

function UserDashboard() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [likedSongs, setLikedSongs] = useState({});
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRefs = useRef({});
  const startTimes = useRef({});
  const audioElementRefs = useRef({}); // New ref for audio DOM elements

  // Fetch Username from Cognito
  useEffect(() => {
    const fetchUsername = () => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            console.error("Session error:", err);
            setError("Failed to fetch user session.");
            return;
          }
          const fetchedUsername = session.getIdToken().payload["cognito:username"];
          setUsername(fetchedUsername);
        });
      } else {
        setError("No user session found.");
      }
    };
    fetchUsername();
  }, []);

  // Fetch Liked Songs
  useEffect(() => {
    if (!username) return;

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`${API_URLS.getLikedSongs}?username=${username}`);
        if (!response.ok) throw new Error("Failed to fetch liked songs");

        const rawData = await response.json();
        const data = rawData.body && typeof rawData.body === "string" 
          ? JSON.parse(rawData.body) 
          : rawData.body;

        const likedMap = {};
        data.forEach((item) => {
          likedMap[item.songId] = true;
        });

        setLikedSongs(likedMap);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, [username]);

  // Fetch All Audio Files
  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(API_URLS.fetchAudio);
        if (!response.ok) throw new Error("Failed to fetch audio");

        const data = await response.json();
        setAudioFiles(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  // 🎧 Handle song start time and reset others
  const handlePlay = async (songId, songName) => {
    // Pause and reset all other audio elements
    Object.entries(audioElementRefs.current).forEach(([id, audioEl]) => {
      if (id !== songId && audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0; // Reset playback position
      }
    });

    if (!songId || !songName) {
      console.error("🚨 Missing songId or songName for play event!");
      return;
    }

    console.log(`🎧 Playing song: ${songName} (ID: ${songId})`);
    startTimes.current[songId] = Date.now();
    const playId = uuidv4();
    audioRefs.current[songId] = { playId };

    try {
      const response = await fetch(API_URLS.songPlay, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          username,
          action: "start",
          playId,
        }),
      });

      const data = await response.json();
      if (data.playId) {
        console.log("✅ Play started, playId:", playId);
      } else {
        console.error("❌ Failed to start song play:", data.error || data);
      }
    } catch (err) {
      console.error("❌ Error starting song play:", err);
    }
  };

  // 🛑 Handle song stop time and calculate duration
  const handlePauseOrEnd = (songId, songName) => {
    if (!songId || !username) {
      console.error("🚨 Missing songId or username for pause/end event!");
      return;
    }

    const playData = audioRefs.current[songId];
    if (!playData || !playData.playId) {
      console.error("❌ Missing playId — cannot track end event!");
      return;
    }

    const duration = Math.floor((Date.now() - startTimes.current[songId]) / 1000);

    console.log(`⏸️ Paused/Ended: ${songName} (ID: ${songId}), Duration: ${duration}s`);

    fetch(API_URLS.songPlay, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        songId,
        username,
        action: "end",
        playId: playData.playId,
        duration,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("✅ Song play tracked:", data))
      .catch((err) => console.error("❌ Error tracking song play:", err));
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
      <UserNavbar/>
      <div className="audio-container">
        <div className="content-wrapper">
          <div className="header">
            <h1  className="app-title" >Liked Songs</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : audioFiles.length === 0 ? (
                      <div className="empty-state">
                        <Music2 size={64} />
                        <p>No audio files available.</p>
                      </div>
                    ) : (
            <div className="songs-grid">
              {audioFiles
                .filter(audio => likedSongs[audio.songId])
                .map((audio) =>
                  !audio.songId || !audio.songName ? (
                    <div key={audio.songId || Math.random()} className="error-message">
                      Invalid song data
                    </div>
                  ) : (
                    <div key={audio.songId} className="song-card">
                      <div className="song-info">
                        <h3 className="song-title">{audio.songName}</h3>
                        <button
                          onClick={() => handleLike(audio.songId, audio.songName)}
                          className={`like-button ${likedSongs[audio.songId] ? "active" : ""}`}
                        >
                          {likedSongs[audio.songId] ? (
                            <Heart className="fill-current" />
                          ) : (
                            <HeartOff />
                          )}
                        </button>
                      </div>
                      <audio
                        ref={(el) => (audioElementRefs.current[audio.songId] = el)}
                        controls
                        onPlay={() => handlePlay(audio.songId, audio.songName)}
                        onPause={() => handlePauseOrEnd(audio.songId, audio.songName)}
                        onEnded={() => handlePauseOrEnd(audio.songId, audio.songName)}
                      >
                        <source src={audio.url} type={audio.contentType} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;