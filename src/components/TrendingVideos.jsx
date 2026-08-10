import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './TrendingVideos.css';

const VideoCard = ({ src }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only play if the video is visible in the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play only if visible
          video.play().catch(() => {});
        } else {
          // Pause if scrolled off-screen
          video.pause();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of card is visible
    );

    observer.observe(video);
    return () => {
      observer.unobserve(video);
    };
  }, []);

  // When hovered, ensure it plays and keep it active
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Link 
      to="/products" 
      className="trending-video-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video 
        ref={videoRef}
        src={src} 
        loop
        muted 
        playsInline 
        preload="metadata"
        className="trending-video"
      />
      <div className="trending-video-overlay">
        <span>Shop Now</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
};

const TrendingVideos = () => {
  const videos = Array.from({ length: 12 }, (_, i) => `/trending-${i + 1}.mp4`);
  // Duplicate videos for seamless infinite scrolling
  const extendedVideos = [...videos, ...videos];
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const resumeTimeoutRef = useRef(null);

  // IntersectionObserver to only auto-scroll when the component is on screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.unobserve(container);
  }, []);

  // requestAnimationFrame scroll loop
  useEffect(() => {
    let animationId;
    const scrollContainer = scrollRef.current;

    // Only animate if the component is visible, not hovered/paused, and the page tab is active
    const scrollStep = () => {
      const isTabActive = !document.hidden;
      if (scrollContainer && !isPaused && isVisible && isTabActive) {
        scrollContainer.scrollLeft += 1.5; // Reduced speed slightly for smoother frame times
        
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 1;
        }
      }
      animationId = requestAnimationFrame(scrollStep);
    };

    animationId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, isVisible]);

  // Handle document visibility change to stop/start animation loop
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleInteractionStart = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Resume auto-scroll after 2.5 seconds of no interaction
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollToPos = direction === 'left' ? scrollLeft - (clientWidth / 2) : scrollLeft + (clientWidth / 2);
      scrollRef.current.scrollTo({ left: scrollToPos, behavior: 'smooth' });
    }
    handleInteractionStart();
    handleInteractionEnd();
  };

  return (
    <div 
      ref={containerRef}
      className="trending-videos-container" 
      style={{ position: 'relative' }}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <button 
        onClick={() => scroll('left')} 
        className="carousel-button left"
        aria-label="Scroll left"
      >
        ❮
      </button>

      <div className="trending-videos-scroll" ref={scrollRef}>
        <div className="trending-videos-track">
          {extendedVideos.map((src, index) => (
            <VideoCard key={index} src={src} />
          ))}
        </div>
      </div>

      <button 
        onClick={() => scroll('right')} 
        className="carousel-button right"
        aria-label="Scroll right"
      >
        ❯
      </button>
    </div>
  );
};

export default TrendingVideos;
