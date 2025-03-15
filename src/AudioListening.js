import React, { useEffect, useState } from "react";
import { Heart, HeartOff, Music2 } from "lucide-react";
import userPool from "./cognitoConfig";

function AudioListening({ refresh }) {
  const [audioFiles, setAudioFiles] = useState([]);
  const [likedSongs, setLikedSongs] = useState({});
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setUsername(session.getIdToken().payload["cognito:username"]);
        });
      }
    };
    fetchUsername();
  }, [refresh]);

  useEffect(() => {
    if (!username) return;

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(
          `https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/get-liked-songs?username=${username}`
        );
        if (!response.ok) throw new Error("Failed to fetch liked songs");

        const rawData = await response.json();
        console.log("Raw API Response:", rawData);

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

        setLikedSongs(likedMap);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, [username]);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/fetch-audio"
        );
        if (!response.ok) throw new Error("Failed to fetch audio");

        const data = await response.json();
        console.log("Audio Files:", data);

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array");
        }

        setAudioFiles(data);
      } catch (error) {
        console.error("Error fetching audio:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

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
    <div className="audio-container">
      <div className="content-wrapper">
        {/* Header Section */}
        <div className="header">
          <h1 className="app-title">Music Stream</h1>

          {/* Option 1: Sign Out on Top-Right Corner */}
          <div className="user-section">
            <span className="user-badge">Welcome, {username || "Guest"}!</span>
          
          </div>

         
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
            {audioFiles.map((audio) =>
              !audio.songId || !audio.songName ? (
                <div
                  key={audio.songId || Math.random()}
                  className="error-message"
                >
                  Invalid song data
                </div>
              ) : (
                <div key={audio.songId} className="song-card">
                  <div className="song-header">
                    <h3 className="song-title">{audio.songName}</h3>
                    <button
                      onClick={() => handleLike(audio.songId, audio.songName)}
                      className={`like-button ${
                        likedSongs[audio.songId] ? "active" : ""
                      }`}
                    >
                      {likedSongs[audio.songId] ? (
                        <Heart className="fill-current" />
                      ) : (
                        <HeartOff />
                      )}
                    </button>
                  </div>
                  <audio controls>
                    <source src={audio.url} type={audio.contentType} />
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
