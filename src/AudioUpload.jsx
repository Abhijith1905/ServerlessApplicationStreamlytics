import React, { useEffect, useState } from "react";
import { Upload, Music2, FileArchive, X } from "lucide-react";
import userPool from "./cognitoConfig";
import AdminNavbar from "./AdminNavbar";

function AudioUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [username, setUsername] = useState("");
  const [isZipUpload, setIsZipUpload] = useState(false);

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
    if (droppedFile) {
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        setIsZipUpload(false);
        setMessage("");
      } else if (droppedFile.name.endsWith(".zip")) {
        setFile(droppedFile);
        setIsZipUpload(true);
        setMessage("");
      } else {
        setMessage("Please upload an audio file or ZIP.");
      }
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setIsZipUpload(false);
        setMessage("");
      } else if (selectedFile.name.endsWith(".zip")) {
        setFile(selectedFile);
        setIsZipUpload(true);
        setMessage("");
      } else {
        setMessage("Please select an audio file or ZIP.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
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

      

      const uploadEndpoint = isZipUpload
        ? "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/multiple-audio-upload"
        : "https://lc36i5jo8b.execute-api.us-east-1.amazonaws.com/dev/upload-audio";

      try {
        const response = await fetch(uploadEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

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
    <div>
      <AdminNavbar />
      <div className="upload-container">
        <div className="upload-wrapper">
        <div className="header">
          <h1 className="app-title" >Upload Music</h1>
        </div>
          <div
            className={`dropzone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="audio/*,.zip"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="dropzone-content">
              {isZipUpload ? <FileArchive size={64} /> : <Music2 size={64} />}
              <p className="dropzone-text">
                Drag and drop your {isZipUpload ? "ZIP file" : "audio file"} here, or click to browse
              </p>
              <p className="dropzone-subtext">Supports audio formats and ZIP files</p>
            </div>
          </div>

          {file && (
            <div className="file-preview">
              <div className="file-info">
                {isZipUpload ? <FileArchive size={20} /> : <Music2 size={20} />}
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
            <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioUpload;