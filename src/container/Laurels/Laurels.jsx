import React, { useEffect, useRef } from 'react';
import { SubHeading } from '../../components';
import { images, data } from '../../constants';
import './Laurels.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AwardCard = ({ award: { imgUrl, title, subtitle } }) => {
  const cardRef = useRef(null);

  return (
    <div className="app__laurels_awards-card" ref={cardRef}>
      <img src={imgUrl} alt="awards" />
      <div className="app__laurels_awards-card_content">
        <p className="p__cormorant" style={{ color: '#DCCA87' }}>{title}</p>
        <p className="p__opensans">{subtitle}</p>
      </div>
    </div>
  );
};

const Laurels = () => {
  const sectionRef = useScrollAnimation();
  const imageRef = useScrollAnimation();
  const awardRefs = useRef([]);

  useEffect(() => {
    const animateSection = () => {
      if (sectionRef.current) {
        sectionRef.current.classList.add('animate__animated', 'animate__fadeIn');
      }
      if (imageRef.current) {
        setTimeout(() => {
          if (imageRef.current) {
            imageRef.current.classList.add('animate__animated', 'animate__fadeInRight');
          }
        }, 200);
      }
      awardRefs.current.forEach((card, index) => {
        if (card) {
          setTimeout(() => {
            if (card) {
              card.classList.add('animate__animated', 'animate__fadeInUp');
            }
          }, index * 200 + 400);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateSection();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sectionElement = sectionRef.current || imageRef.current;
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, [sectionRef, imageRef]);

  return (
    <div className="app__bg app__wrapper section__padding" id="awards" ref={sectionRef}>
      <div className="app__wrapper_info">
        <SubHeading title="Awards & recognition" />
        <h1 className="headtext__cormorant">Our Laurels</h1>

        <div className="app__laurels_awards">
          {data.awards.map((award, index) => (
            <AwardCard
              key={award.title}
              award={award}
              ref={(el) => (awardRefs.current[index] = el)}
            />
          ))}
        </div>
      </div>

      <div className="app__wrapper_img" ref={imageRef}>
        <img src={images.laurels} alt="laurels_img" />
      </div>
    </div>
  );
};

export default Laurels;