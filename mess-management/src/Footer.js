import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import './Footer.css'; // Create a CSS file for styles

const Footer = () => {
    return (
      <div className="footer">
        <Link to="/" className="footer-icon">
          <i className="fas fa-home"></i> {/* Home icon */}
        </Link>
        <Link to="/attendance" className="footer-icon">
          <i className="fas fa-calendar-check"></i> {/* Attendance icon */}
        </Link>
        <Link to="/qr-scanner" className="footer-icon">
          <i className="fas fa-qrcode"></i> {/* Profile icon */}
        </Link>
      </div>
    );
  };

export default Footer;
