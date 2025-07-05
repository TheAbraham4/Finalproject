import React, { useEffect } from 'react';
import { SubHeading } from '../../components';
import { images } from '../../constants';
import './Chef.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const Chef = () => {
  const imageRef = useScrollAnimation();
  const textRef = useScrollAnimation();
  const signatureRef = useScrollAnimation();

  useEffect(() => {
    const animateElements = () => {
      if (imageRef.current) {
        setTimeout(() => {
          if (imageRef.current) {
            imageRef.current.classList.add('animate__animated', 'animate__fadeInLeft');
          }
        }, 100);
      }
      if (textRef.current) {
        setTimeout(() => {
          if (textRef.current) {
            textRef.current.classList.add('animate__animated', 'animate__fadeInRight');
          }
        }, 200);
      }
      if (signatureRef.current) {
        setTimeout(() => {
          if (signatureRef.current) {
            signatureRef.current.classList.add('animate__animated', 'animate__fadeInUp');
          }
        }, 300);
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

    const sectionRef = imageRef.current || textRef.current || signatureRef.current;
    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => {
      if (sectionRef) {
        observer.unobserve(sectionRef);
      }
    };
  }, [imageRef, textRef, signatureRef]);

  return (
    <div className="app__bg app__wrapper section__padding">
      <div className="app__wrapper_img app__wrapper_img-reverse" ref={imageRef}>
        <img src={images.chef} alt="chef_image" />
      </div>
      <div className="app__wrapper_info" ref={textRef}>
        <SubHeading title="Chef's word" />
        <h1 className="headtext__cormorant">What we believe in</h1>

        <div className="app__chef-content">
          <div className="app__chef-content_quote">
            <img src={images.quote} alt="quote_image" />
            <p className="p__opensans">Food isn’t just about taste</p>
          </div>
          <p className="p__opensans"> it’s about connection, culture, and care. Every dish we serve carries our passion, our story, and a promise to nourish both body and soul. </p>
        </div>

        <div className="app__chef-sign" ref={signatureRef}>
          <p>Kevin Luo</p>
          <p className="p__opensans">Chef & Founder</p>
          <img src={images.sign} alt="sign_image" />
        </div>
      </div>
    </div>
  );
};

export default Chef;