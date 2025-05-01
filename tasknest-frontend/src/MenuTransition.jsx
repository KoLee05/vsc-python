import { useState, useEffect } from 'react';

export default function MenuTransition({ view, children }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentView, setCurrentView] = useState(view);

  useEffect(() => {
    if (view !== currentView) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentView(view);
        setIsAnimating(false);
      }, 300); // increased from 200ms to 300ms
      return () => clearTimeout(timer);
    }
  }, [view, currentView]);

  return (
    <div className={`transform transition-all duration-300 ease-in-out ${
      isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
    }`}>
      {children}
    </div>
  );
}
