import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "./amplifyconfiguration.json";
import { CognitoUser } from "amazon-cognito-identity-js";
import userPool from "./cognitoConfig";
import "./customAuth.css"

import AudioListening from "./AudioListening";
import AudioUpload from "./AudioUpload";
import Home from "./Home";
import UserHome from "./UserHome";
import AdminHome from "./AdminHome";
import AdminAudioListening from './AdminAudioListening';
import AdminDashboard from "./AdminDashboard";
import UserDashboard from './UserDashboard';
import RecommendedSongs from './RecommendedSongs';

Amplify.configure(config);

function AppWrapper({ signOut, user }) {
  return (
    <Router>
      <App signOut={signOut} user={user} />
    </Router>
  );
}

function App({ signOut, user }) {
  const [group, setGroup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroup = () => {
      const cognitoUser = new CognitoUser({
        Username: user.username,
        Pool: userPool,
      });

      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error("Session error:", err);
          return;
        }
        const idToken = session.getIdToken().decodePayload();
        const groups = idToken["cognito:groups"] || [];

        if (groups.includes("Admin")) {
          setGroup("Admin");
        } else if (groups.includes("User")) {
          setGroup("User");
        } else {
          setGroup("None");
        }
      });
    };

    fetchUserGroup();
  }, [user]);

  const handleSignOut = () => {
    signOut();
    localStorage.clear();
    sessionStorage.clear();

     navigate("/", { replace: true }); // Navigate to home and replace the current history entry
    // window.location.reload(); // Force a full reload to clear all state
  };
  

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (group === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>

    <div className="app-container">
      <div className="top-right">
        <span style={{ color: "white" }}>Welcome, {user.username}!!</span>
        <button className="signout-button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            group === "Admin" ? (
              <Navigate to="/admin-home" />
            ) : group === "User" ? (
              <Navigate to="/user-home" />
            ) : (
              <Home signOut={signOut} user={user} />
            )
          }
        />

        <Route
          path="/user-home"
          element={group === "User" ? <UserHome /> : <div>Access Denied</div>}
        />

        <Route
          path="/admin-home"
          element={group === "Admin" ? <AdminHome /> : <div>Access Denied</div>}
        />
        <Route
          path="/upload-audio"
          element={group === "Admin" ? <AudioUpload /> : <div>Access Denied</div>}
        />

        <Route
          path="/admin-dashboard"
          element={group === "Admin" ? <AdminDashboard /> : <div>Access Denied</div>}
        />

        {/* <Route
          path="/fetch-audio"
          element={<AudioListening /> }
        /> */}

        <Route
          path="/admin-fetch-audio"
          element={group === "Admin" ? <AdminAudioListening /> : <div>Access Denied</div>}
        />
         <Route
          path="/user-fetch-audio"
          element={group === "User" ? <AudioListening /> : <div>Access Denied</div>}
        />

       <Route
          path="/user-recommendations"
          element={group === "User" ? <RecommendedSongs /> : <div>Access Denied</div>}
        />

        <Route
          path="/user-favourites"
          element={group === "User" ? <UserDashboard /> : <div>Access Denied</div>}
        />
       
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
    </div>
  );
}

export default withAuthenticator(AppWrapper);