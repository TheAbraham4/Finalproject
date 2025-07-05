import React, { useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import images from '../../constants/images';
import './Navbar.css';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to truncate name if too long
  const truncateName = (name) => {
    if (!name) return '';
    return name.length > 10 ? `${name.substring(0, 8)}...` : name;
  };

  return (
    <nav className="app__navbar">
      <div className="app__navbar-logo">
        <Link to="/">
          <img src={images.gericht} alt="app__logo" className="animate__animated animate__fadeIn" />
        </Link>
      </div>
      <ul className="app__navbar-links">
        {location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/profile' && location.pathname !== '/admin' && (
          <>
            <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.1s' }}>
              <a href="#home">Home</a>
            </li>
            <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.2s' }}>
              <a href="#about">About</a>
            </li>
            <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.3s' }}>
              <a href="#menu">Menu</a>
            </li>
            <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.4s' }}>
              <a href="#awards">Awards</a>
            </li>
            <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.5s' }}>
              <a href="#contact">Contact</a>
            </li>
          </>
        )}
      </ul>
      <div className="app__navbar-login">
        {isAuthenticated && currentUser ? (
          <>
            <Link to="/profile" className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.6s' }}>
              Welcome, {truncateName(currentUser.firstName)}
            </Link>
            {currentUser.role === 'admin' && (
              <>
                <div />
                <Link to="/admin" className="p__opensans animate__animated animate__fadeIn admin-link" style={{ animationDelay: '0.65s' }}>
                  Admin Dashboard
                </Link>
              </>
            )}
            <div />
            <button onClick={handleLogout} className="p__opensans animate__animated animate__fadeIn app__navbar-link-button" style={{ animationDelay: '0.7s' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.6s' }}>
              Log In / Registration
            </Link>
            <div />
            <button className="p__opensans animate__animated animate__fadeIn app__navbar-link-button" style={{ animationDelay: '0.7s' }} onClick={() => window.location.hash = '#contact'}>
              Book Table
            </button>
          </>
        )}
      </div>
      <div className="app__navbar-smallscreen">
        <GiHamburgerMenu color="#fff" fontSize={27} onClick={() => setToggleMenu(true)} />
        {toggleMenu && (
          <div className="app__navbar-smallscreen_overlay flex__center slide-bottom">
            <MdOutlineRestaurantMenu fontSize={27} className="overlay__close" onClick={() => setToggleMenu(false)} />
            <ul className="app__navbar-smallscreen_links">
              {location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/profile' && location.pathname !== '/admin' && (
                <>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.1s' }}>
                    <a href="#home" onClick={() => setToggleMenu(false)}>Home</a>
                  </li>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.2s' }}>
                    <a href="#about" onClick={() => setToggleMenu(false)}>About</a>
                  </li>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.3s' }}>
                    <a href="#menu" onClick={() => setToggleMenu(false)}>Menu</a>
                  </li>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.4s' }}>
                    <a href="#awards" onClick={() => setToggleMenu(false)}>Awards</a>
                  </li>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.5s' }}>
                    <a href="#contact" onClick={() => setToggleMenu(false)}>Contact</a>
                  </li>
                </>
              )}
              {isAuthenticated && currentUser && (
                <>
                  <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.6s' }}>
                    <Link to="/profile" onClick={() => setToggleMenu(false)}>My Profile</Link>
                  </li>
                  {currentUser.role === 'admin' && (
                    <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.65s' }}>
                      <Link to="/admin" onClick={() => setToggleMenu(false)}>Admin Dashboard</Link>
                    </li>
                  )}
                </>
              )}
              {isAuthenticated && currentUser ? (
                <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.7s' }}>
                  <button onClick={() => { setToggleMenu(false); handleLogout(); }} className="app__navbar-link-button">Logout</button>
                </li>
              ) : (
                <li className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.7s' }}>
                  <Link to="/login" onClick={() => setToggleMenu(false)}>Login</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;



