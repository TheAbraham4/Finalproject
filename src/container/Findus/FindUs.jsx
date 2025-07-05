import React, { useEffect } from 'react';
import { SubHeading } from '../../components';
import { images } from '../../constants';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const FindUs = () => {
  const infoRef = useScrollAnimation();
  const imageRef = useScrollAnimation();

  useEffect(() => {
    const animateElements = () => {
      if (infoRef.current) {
        infoRef.current.classList.add('animate__animated', 'animate__fadeInLeft');
      }
      if (imageRef.current) {
        imageRef.current.classList.add('animate__animated', 'animate__fadeInRight');
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateElements();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sectionRef = infoRef.current || imageRef.current;
    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => {
      if (sectionRef) {
        observer.unobserve(sectionRef);
      }
    };
  }, [infoRef, imageRef]);

  return (
    <div className="app__bg app__wrapper section__padding" id="contact">
      <div className="app__wrapper_info" ref={infoRef}>
        <SubHeading title="Contact" />
        <h1 className="headtext__cormorant" style={{ marginBottom: '3rem' }}>Find Us</h1>
        <div className="app__wrapper-content">
          <p className="p__opensans">Lane Ends Bungalow, Whatcroft Hall Lane, Rudheath, CW9 75G</p>
          <p className="p__cormorant" style={{ color: '#DCCA87', margin: '2rem 0' }}>Opening Hours</p>
          <p className="p__opensans">Mon - Fri: 10:00 am - 02:00 am</p>
          <p className="p__opensans">Sat - Sun: 10:00 am - 03:00 am</p>
        </div>
        <button type="button" className="custom__button" style={{ marginTop: '2rem' }}>Visit Us</button>
      </div>

      <div className="app__wrapper_img" ref={imageRef}>
        <img src={images.findus} alt="finus_img" />
      </div>
    </div>
  );
};

export default FindUs;