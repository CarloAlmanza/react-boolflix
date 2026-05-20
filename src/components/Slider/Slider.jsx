import React, { useRef, useState, useEffect } from 'react';
import Card from '../Card/Card';
import './Slider.css';

const Slider = ({ title, icon, color, items, loading }) => {
    const sliderRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Debug: stampiamo cosa riceviamo
    console.log(`Slider ${title} - items:`, items?.length, 'loading:', loading);

    const checkScrollPosition = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        window.addEventListener('resize', checkScrollPosition);
        return () => window.removeEventListener('resize', checkScrollPosition);
    }, [items]);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScrollPosition, 300);
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderRef.current.scrollLeft = scrollLeft - walk;
        checkScrollPosition();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Stato di caricamento
    if (loading) {
        return (
            <div className="slider-section">
                <div className="slider-header">
                    <h2 style={{ borderLeftColor: color }}>
                        <span className="slider-icon">{icon}</span>
                        {title}
                    </h2>
                </div>
                <div className="slider-loading">
                    <div className="loading-spinner-small"></div>
                    <p>Caricamento in corso...</p>
                </div>
            </div>
        );
    }

    // Se non ci sono items o è vuoto
    if (!items || items.length === 0) {
        console.log(`Nessun item per ${title}`);
        return null;
    }

    return (
        <div className="slider-section">
            <div className="slider-header">
                <h2 style={{ borderLeftColor: color }}>
                    <span className="slider-icon">{icon}</span>
                    {title}
                </h2>
                <div className="slider-controls">
                    {showLeftArrow && (
                        <button
                            className="slider-arrow left"
                            onClick={() => scroll('left')}
                            aria-label="Scorri a sinistra"
                        >
                            ‹
                        </button>
                    )}
                    {showRightArrow && (
                        <button
                            className="slider-arrow right"
                            onClick={() => scroll('right')}
                            aria-label="Scorri a destra"
                        >
                            ›
                        </button>
                    )}
                </div>
            </div>

            <div
                className="slider-container"
                ref={sliderRef}
                onScroll={checkScrollPosition}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="slider-track">
                    {items.map((item, index) => {
                        // Debug: stampiamo il primo item per vedere se ha poster_path
                        if (index === 0) {
                            console.log(`Primo item di ${title}:`, {
                                title: item.title || item.name,
                                poster_path: item.poster_path,
                                hasImage: !!item.poster_path
                            });
                        }
                        return (
                            <div key={`${item.media_type || 'item'}-${item.id}-${index}`} className="slider-item">
                                <Card item={item} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Slider;