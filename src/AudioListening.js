import React, { useEffect, useState, useRef } from "react";
import { Heart, HeartOff, Music2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";  // UUID library for generating unique IDs
import userPool from "./cognitoConfig";

// ✅ API URLs (customized per endpoint)
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
  const audioRefs = useRef({}); // Track multiple audio refs
  const startTimes = useRef({}); // Track start times per song

  // 🎯 Fetch Username from Cognito
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
          console.log("✅ Fetched username:", fetchedUsername);
          setUsername(fetchedUsername);
        });
      } else {
        setError("No user session found.");
      }
    };
    fetchUsername();
  }, []);

  // 🎯 Fetch Liked Songs
  useEffect(() => {
    if (!username) return;

    const fetchLikedSongs = async () => {
      try {
        console.log(`🔍 Fetching liked songs for: ${username}`);
        const response = await fetch(`${API_URLS.getLikedSongs}?username=${username}`);
        if (!response.ok) throw new Error("Failed to fetch liked songs");

        const rawData = await response.json();
        const data =
          rawData.body && typeof rawData.body === "string"
            ? JSON.parse(rawData.body)
            : rawData.body;

        if (!Array.isArray(data)) {
          console.error("Expected an array but got:", typeof data, data);
          return;
        }

        const likedMap = {};
        data.forEach((item) => {
          likedMap[item.songId] = true;
        });

        console.log("❤️ Liked songs:", likedMap);
        setLikedSongs(likedMap);
      } catch (error) {
        console.error("❌ Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, [username]);

  // 🎧 Fetch Audio Files
  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("🎧 Fetching audio files...");
        const response = await fetch(API_URLS.fetchAudio);
        if (!response.ok) throw new Error("Failed to fetch audio");

        const data = await response.json();
        console.log("🎵 Fetched audio data:", data);

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array");
        }

        setAudioFiles(data);
      } catch (error) {
        console.error("❌ Error fetching audio:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  // 🎧 Handle song start time
  const handlePlay = async (songId, songName) => {
    if (!songId || !songName) {
      console.error("🚨 Missing songId or songName for play event!");
      return;
    }

    console.log(`🎧 Playing song: ${songName} (ID: ${songId})`);
    startTimes.current[songId] = Date.now();
    const playId = uuidv4(); // Generate a unique playId for the song

    audioRefs.current[songId] = { playId }; // Store the generated playId

    try {
      const response = await fetch(API_URLS.songPlay, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          username,
          action: "start",
          playId, // Send the generated playId
        }),
      });

      const data = await response.json();
      if (data.playId) {
        console.log("✅ Play started, playId:", playId); // Use frontend-generated playId
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
      playId: playData.playId, // Send the frontend-generated playId
      duration,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("✅ Song play tracked:", data))
    .catch((err) => console.error("❌ Error tracking song play:", err));
};


  return (
    <div className="audio-container">
      <div className="content-wrapper">
        <div className="header">
          <h1 className="home-title">Music Stream</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="songs-grid">
            {audioFiles.map((audio) =>
              !audio.songId || !audio.songName ? (
                <div key={audio.songId || Math.random()} className="error-message">
                  Invalid song data
                </div>
              ) : (
                <div key={audio.songId} className="song-card">
                  <h3 className="song-title">{audio.songName}</h3>
                  <audio
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
  );
}

export default AudioListening;
