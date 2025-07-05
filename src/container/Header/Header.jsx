import React from 'react';
import images from '../../constants/images';
import './Header.css';

const Header = () => (
  <div className="app__header app__wrapper section__padding" id="home">
    <div className="app__wrapper_info">
      <p className="p__cormorant animate__animated animate__fadeIn" style={{ animationDelay: '0.1s' }}>
        Chase The New Flavour
      </p>
      <h1 className="headtext__cormorant animate__animated animate__fadeIn" style={{ animationDelay: '0.2s' }}>
        THE KEY TO THE FINE DINING
      </h1>
      <p className="p__opensans animate__animated animate__fadeIn" style={{ animationDelay: '0.3s' }}>
        Experience Culinary Excellence Where Taste Meets Sophistication.
      </p>
      <button type="button" className="custom__button animate__animated animate__fadeIn" style={{ animationDelay: '0.4s' }}>
        Explore Menu
      </button>
    </div>
    <div className="app__wrapper_img">
      <img src={images.welcome} alt="header img" className="animate__animated animate__fadeIn" style={{ animationDelay: '0.5s' }} />
    </div>
  </div>
);

export default Header;