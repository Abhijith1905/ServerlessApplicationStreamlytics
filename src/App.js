import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "./amplifyconfiguration.json";
import { CognitoUser } from "amazon-cognito-identity-js";
import userPool from "./cognitoConfig"; // Your Cognito Config

import AudioListening from "./AudioListening";
import AudioUpload from "./AudioUpload";
import Home from "./Home";

Amplify.configure(config);

function App({ signOut, user }) {
  return (
    <Router>
      <MainApp signOut={signOut} user={user} />
    </Router>
  );
}

function MainApp({ signOut, user }) {
  const [group, setGroup] = useState("");
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
          navigate("/upload-audio"); // Redirect for Admin
        } else if (groups.includes("User")) {
          setGroup("User");
          navigate("/fetch-audio"); // Redirect for User
        }
      });
    };

    fetchUserGroup();
  }, [user, navigate]);

  return (
    <>
      <div className="top-right">
      <span style={{ color: "white" }}>Welcome, {user.username}!!</span>
        <button className="signout-button" onClick={signOut}>Sign out</button>
      </div>
      <Routes>
        <Route path="/" element={<Home signOut={signOut} user={user} />} />
        <Route path="/fetch-audio" element={<AudioListening />} />
        <Route path="/upload-audio" element={<AudioUpload />} />
      </Routes>
    </>
  );
}

export default withAuthenticator(App);

