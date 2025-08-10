import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <img src={assets.logo} alt="Quickbite" className="footer-logo" />
          <p className="footer-tagline">
            Fresh bites. Fast delivery. Your favorites, right at your door.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><img src={assets.facebook_icon} alt="Facebook" /></a>
            <a href="#" aria-label="Twitter"><img src={assets.twitter_icon} alt="Twitter" /></a>
            <a href="#" aria-label="LinkedIn"><img src={assets.linkedin_icon} alt="LinkedIn" /></a>
          </div>
        </div>

        {/* Links */}
        <nav className="footer-links">
          <h4>Explore</h4>
          <a href="#explore-menu">Menu</a>
          <a href="#app-download">Mobile app</a>
          <a href="#footer">Contact us</a>
          <a href="/">Home</a>
        </nav>

        {/* Contact */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: support@quickbite.com</p>
          <p>Phone: +91 90000 00000</p>
          <p>Hours: 9:00 AM – 10:00 PM</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Quickbite. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
