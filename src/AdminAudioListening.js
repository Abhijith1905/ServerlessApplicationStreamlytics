import React, { useEffect, useState, useRef } from "react";
import { Trash2, Music2, PlayCircle } from "lucide-react";
import userPool from "./cognitoConfig";
import AdminNavbar from './AdminNavbar';

function AdminAudioListening() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioElementRefs = useRef({}); // Ref to track audio elements

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
  }, []);

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
        setAudioFiles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching audio:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  const handlePlay = (songId) => {
    // Pause and reset all other audio elements
    Object.entries(audioElementRefs.current).forEach(([id, audioEl]) => {
      if (id !== songId && audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });
  };

  const handleDelete = async (songId) => {
    try {
      const response = await fetch(
        "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/delete-audio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId }),
        }
      );

      if (response.ok) {
        setAudioFiles(prev => prev.filter(audio => audio.songId !== songId));
      } else {
        setError("Failed to delete audio file");
      }
    } catch (error) {
      console.error("Error deleting audio:", error);
      setError("Error deleting audio file");
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="audio-container">
        <div className="content-wrapper">
          <div className="header">
            <h1 className="app-title">Admin Audio Management</h1>
            {error && <div className="error-message">{error}</div>}
          </div>

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
              {audioFiles.map((audio) => (
                <div key={audio.songId} className="song-card">
                  <div className="song-header">
                    <h3 className="song-title">{audio.songName}</h3>
                    <button
                      onClick={() => handleDelete(audio.songId)}
                      className="delete-button"
                      title="Delete song"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <audio
                    ref={(el) => (audioElementRefs.current[audio.songId] = el)}
                    controls
                    onPlay={() => handlePlay(audio.songId)}
                  >
                    <source src={audio.url} type={audio.contentType} />
                    Your browser does not support the audio element.
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

export default AdminAudioListening;