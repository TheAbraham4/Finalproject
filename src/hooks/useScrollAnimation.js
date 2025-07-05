import { useEffect, useRef } from 'react';

const useScrollAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current; // Capture ref.current in a variable

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', 'animate__fadeIn');
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
  }, []);

  return ref;
};

export default useScrollAnimation;