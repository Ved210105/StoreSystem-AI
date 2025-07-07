import React from 'react';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    &copy; {new Date().getFullYear()} Adaptive Retail. All rights reserved.
  </footer>
);

export default Footer;
