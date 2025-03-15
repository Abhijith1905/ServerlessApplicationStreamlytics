import React, { useEffect, useState } from "react";
import { Upload, Music2, X } from "lucide-react";
import userPool from "./cognitoConfig";


function AudioUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [username, setUsername] = useState("");

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
      setMessage("");
    } else {
      setMessage("Please upload an audio file.");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setMessage("");
    } else {
      setMessage("Please select an audio file.");
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
          setMessage("Upload successful!");
          setFile(null);
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
    <div className="upload-container">
      <div className="upload-wrapper">
        <h1 className="home-title">Upload Music</h1>

        <div
          className={`dropzone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <div className="dropzone-content">
            <Music2 size={64} />
            <p className="dropzone-text">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="dropzone-subtext">Supports all audio formats</p>
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
      </div>
    </div>
  );
}

export default AudioUpload;