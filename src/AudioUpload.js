import React, { useEffect, useState } from "react";
import { Upload, Music2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userPool from "./cognitoConfig";

function AudioUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [refreshAudio, setRefreshAudio] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = () => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            console.error("Session error:", err);
            setMessage("Failed to fetch user session.");
            return;
          }
          setUsername(session.getIdToken().payload["cognito:username"]);
        });
      }
    };
    fetchUsername();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an audio file to upload.");
      return;
    }

    if (!username) {
      setMessage("User not authenticated. Please log in.");
      return;
    }

    setUploading(true);
    setMessage("");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result.split(",")[1];

      const requestBody = {
        fileName: file.name,
        fileContent: base64Data,
        username: username,
      };

      try {
        const response = await fetch(
          "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/upload-audio",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setMessage(`Upload successful! File URL: ${data.file_url}`);
          setFile(null);
          setRefreshAudio((prev) => !prev);
        } else {
          setMessage(`Upload failed: ${data.error}`);
        }
      } catch (error) {
        setMessage("Error uploading file.");
      }

      setUploading(false);
    };
  };

  return (
    <div>
      <div className="upload-container">
        <div className="upload-wrapper">
          <h1 className="app-title">Upload Music</h1>

          <div className={`dropzone ${dragActive ? "drag-active" : ""}`}>
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <div>
              <Music2 size={64} className="mx-auto mb-4" />
              <p className="text-lg mb-2">
                Drag and drop your audio file here, or click to browse
              </p>
              <p className="text-sm">Supports all audio formats</p>
            </div>
          </div>

          {file && (
            <div className="file-preview">
              <div className="file-info">
                <Music2 size={20} />
                <span>{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="delete-button">
                <X size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="upload-button"
          >
            {uploading ? (
              <>
                <div className="spinner"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload</span>
              </>
            )}
          </button>

          {message && (
            <div
              className={`message ${
                message.includes("successful") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={() => navigate("/audiolistening")}
            className="navigate-button"
          >
            Go to Audio Listening
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioUpload;
