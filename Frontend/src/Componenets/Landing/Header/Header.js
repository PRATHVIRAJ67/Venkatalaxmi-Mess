import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNav = () => {
    const nextState = !isMobileNavActive;
    setIsMobileNavActive(nextState);
    document.body.classList.toggle('mobile-nav-active', nextState);
  };

  const closeMobileNav = () => {
    setIsMobileNavActive(false);
    document.body.classList.remove('mobile-nav-active');
  };

  return (
    <header id="header" className={`header d-flex align-items-center sticky-top ${isScrolled ? 'scrolled' : ''}`}>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
      <div className="container position-relative d-flex align-items-center justify-content-between">

        <a href="index.html" className="logo d-flex align-items-center me-auto me-xl-0">
          <img src="/img/Venkatalakshmi Logo.png" alt="Venkatalakshmi Logo" />
        </a>

        <nav id="navmenu" className={`navmenu ${isMobileNavActive ? 'mobile-nav-active' : ''}`}>
          <ul>
            {['Home', 'about', 'menu', 'gallery', 'contact'].map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={closeMobileNav}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              </li>
            ))}
          </ul>

          <div
            className="mobile-nav-toggle"
            onClick={toggleMobileNav}
            role="button"
            aria-label="Toggle mobile navigation"
          >
            <i
              className={`bi ${isMobileNavActive ? 'bi-x' : 'bi-list'}`}
              tabIndex="-1"
              aria-hidden="true"
            ></i>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
