import React, { useEffect, useRef } from 'react';
import { SubHeading, MenuItem } from '../../components';
import { data, images } from '../../constants';
import './SpecialMenu.css';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const SpecialMenu = () => {
  const sectionRef = useScrollAnimation();
  const wineItemsRef = useRef([]);
  const cocktailItemsRef = useRef([]);

  useEffect(() => {
    const element = sectionRef.current; // Capture sectionRef.current in a variable

    const animateItems = () => {
      wineItemsRef.current.forEach((item, index) => {
        if (item) {
          setTimeout(() => item.classList.add('animate__animated', 'animate__fadeInUp'), index * 150);
        }
      });
      cocktailItemsRef.current.forEach((item, index) => {
        if (item) {
          setTimeout(() => item.classList.add('animate__animated', 'animate__fadeInUp'), index * 150 + 300);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateItems();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element); // Use the captured variable
      }
    };
  }, [sectionRef]); // Add sectionRef to the dependency array

  return (
    <div className="app__specialMenu flex__center section__padding" id="menu" ref={sectionRef}>
      <div className="app__specialMenu-title">
        <SubHeading title="Menu that fits your palatte" />
        <h1 className="headtext__cormorant">Today's Special</h1>
      </div>

      <div className="app__specialMenu-menu">
        <div className="app__specialMenu-menu_wine flex__center">
          <p className="app__specialMenu-menu_heading">Wine & Beer</p>
          <div className="app__specialMenu_menu_items">
            {data.wines.map((wine, index) => (
              <div
                key={wine.title + index}
                ref={(el) => (wineItemsRef.current[index] = el)}
              >
                <MenuItem title={wine.title} price={wine.price} tags={wine.tags} />
              </div>
            ))}
          </div>
        </div>

        <div className="app__specialMenu-menu_img">
          <img src={images.menu} alt="menu__img" />
        </div>

        <div className="app__specialMenu-menu_cocktails flex__center">
          <p className="app__specialMenu-menu_heading">Cocktails</p>
          <div className="app__specialMenu_menu_items">
            {data.cocktails.map((cocktail, index) => (
              <div
                key={cocktail.title + index}
                ref={(el) => (cocktailItemsRef.current[index] = el)}
              >
                <MenuItem title={cocktail.title} price={cocktail.price} tags={cocktail.tags} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 15 }}>
        <button type="button" className="custom__button">View More</button>
      </div>
    </div>
  );
};

export default SpecialMenu;