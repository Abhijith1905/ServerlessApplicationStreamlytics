import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Streamlytics</h1>
        <p>Your personalized audio streaming experience starts here!</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </header>
      <section className="about-section">
        <h2>About Us</h2>
        <p>Streamlytics is an AI-driven audio streaming platform that personalizes your experience and provides real-time insights.</p>
      </section>
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>Email: support@streamlytics.com</p>
        <p>Phone: +123-456-7890</p>
      </section>
    </div>
  );
}

export default LandingPage;