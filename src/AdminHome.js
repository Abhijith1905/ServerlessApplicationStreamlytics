import React from "react";
import { Link } from "react-router-dom";
import { Home, Upload, Music2, BarChart2 } from "lucide-react";

function AdminHome() {
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#1a1b26',
      padding: '20px'
    },
    content: {
      marginTop: '40px',
      background: '#1f2937',
      borderRadius: '30px',
      padding: '40px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      color: '#ffffff'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderRadius: '15px',
      marginBottom: '40px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#c4b5fd'
    },
    nav: {
      display: 'flex',
      gap: '20px'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#ffffff',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'background 0.3s ease'
    },
    activeNavLink: {
      background: 'rgba(196, 181, 253, 0.1)',
      color: '#c4b5fd'
    },
    title: {
      fontSize: '2.5rem',
      marginBottom: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(to right, #c4b5fd, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      padding: '20px'
    },
    card: {
      background: '#1a1b26',
      borderRadius: '20px',
      padding: '25px',
      border: '1px solid rgba(196, 181, 253, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      color: '#ffffff',
      textDecoration: 'none'
    },
    cardHover: {
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: '#c4b5fd',
        background: '#272935'
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <Music2 size={24} color="#c4b5fd" />
            <span>Streamlytics</span>
          </div>
          <nav style={styles.nav}>
            <Link to="/admin" style={{...styles.navLink, ...styles.activeNavLink}}>
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/upload-audio" style={styles.navLink}>
              <Upload size={20} />
              <span>Upload</span>
            </Link>
            <Link to="/admin-dashboard" style={styles.navLink}>
              <BarChart2 size={20} />
              <span>Dashboard</span>
            </Link>
          </nav>
        </header>

        <h1 style={styles.title}>Admin Control Center</h1>

        <div style={styles.cardGrid}>
          <Link to="/upload-audio" style={{...styles.card, ...styles.cardHover}}>
            <Upload size={32} color="#c4b5fd" />
            <span>Upload Audio</span>
          </Link>
          <Link to="/admin-fetch-audio" style={{...styles.card, ...styles.cardHover}}>
            <Music2 size={32} color="#c4b5fd" />
            <span>Manage Audio</span>
          </Link>
          <Link to="/admin-dashboard" style={{...styles.card, ...styles.cardHover}}>
            <BarChart2 size={32} color="#c4b5fd" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;