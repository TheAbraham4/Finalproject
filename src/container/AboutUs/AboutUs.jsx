import React, { useEffect } from 'react';
import { images } from '../../constants';
import './AboutUs.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AboutUs = () => {
  const overlayRef = useScrollAnimation();
  const aboutRef = useScrollAnimation();
  const historyRef = useScrollAnimation();
  const knifeRef = useScrollAnimation();

  useEffect(() => {
    const animateElements = () => {
      if (overlayRef.current) {
        setTimeout(() => overlayRef.current.classList.add('animate__fadeIn'), 100);
      }
      if (aboutRef.current) {
        setTimeout(() => aboutRef.current.classList.add('animate__fadeInLeft'), 200);
      }
      if (historyRef.current) {
        setTimeout(() => historyRef.current.classList.add('animate__fadeInRight'), 300);
      }
      if (knifeRef.current) {
        setTimeout(() => knifeRef.current.classList.add('animate__fadeInUp'), 400);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateElements();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const sectionRef = overlayRef.current || aboutRef.current || historyRef.current || knifeRef.current;
    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => {
      if (sectionRef) {
        observer.unobserve(sectionRef);
      }
    };
  }, [overlayRef, aboutRef, historyRef, knifeRef]);

  return (
    <div className="app__aboutus app__bg flex__center section__padding" id="about">
      <div ref={overlayRef} className="app__aboutus-overlay flex__center">
        <img src={images.G} alt="G_overlay" />
      </div>

      <div className="app__aboutus-content flex__center">
        <div ref={aboutRef} className="app__aboutus-content_about">
          <h1 className="headtext__cormorant">About Us</h1>
          <img src={images.spoon} alt="about_spoon" className="spoon__img" />
          <p className="p__opensans">
            At Abraham, we believe dining is more than just a meal — it's a celebration of craftsmanship, tradition, and taste. Our passionate chefs blend timeless techniques with innovative flair to create unforgettable culinary experiences.
          </p>
          <button type="button" className="custom__button">Know More</button>
        </div>

        <div ref={knifeRef} className="app__aboutus-content_knife flex__center">
          <img src={images.knife} alt="about_knife" />
        </div>

        <div ref={historyRef} className="app__aboutus-content_history">
          <h1 className="headtext__cormorant">Our History</h1>
          <img src={images.spoon} alt="about_spoon" className="spoon__img" />
          <p className="p__opensans">
            Born from a love of fine cuisine and hospitality, Abraham was founded with a mission to elevate every dining moment. From humble beginnings to award-winning excellence, our journey is rooted in authenticity, quality, and a relentless pursuit of perfection.
          </p>
          <button type="button" className="custom__button">Know More</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;