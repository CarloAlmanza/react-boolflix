import React from 'react';
import { useHomepageData } from '../../hooks/useHomepageData';
import Slider from '../Slider/Slider';
import './Homepage.css';

const Homepage = () => {
    const { sections, sectionsConfig } = useHomepageData();

    // Debug: stampiamo lo stato delle sezioni
    console.log('Stato sezioni homepage:', {
        trendingToday: sections.trendingToday.data.length,
        topRatedMovies: sections.topRatedMovies.data.length,
        popularMovies: sections.popularMovies.data.length
    });

    // Hero Section con immagine di sfondo dinamica
    const heroBackground = sections.trendingToday.data[0]?.backdrop_path
        ? `https://image.tmdb.org/t/p/original${sections.trendingToday.data[0].backdrop_path}`
        : 'https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png';

    return (
        <div className="homepage">
            {/* Hero Section - Banner principale */}
            <div
                className="hero-section"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(229, 9, 20, 0.3) 100%), url(${heroBackground})`
                }}
            >
                <div className="hero-content">
                    <h1 className="hero-title">BoolFlix</h1>
                    <p className="hero-subtitle">
                        Film e serie TV illimitati. Scopri i contenuti più amati del momento.
                    </p>
                    <div className="hero-buttons">
                        <button className="hero-btn primary">▶ Play</button>
                        <button className="hero-btn secondary">ℹ️ Altre informazioni</button>
                    </div>
                </div>
            </div>

            {/* Sezioni dinamiche */}
            <div className="sections-container">
                {sectionsConfig.map((config) => {
                    const sectionData = sections[config.id];
                    return (
                        <Slider
                            key={config.id}
                            title={config.title}
                            icon={config.icon}
                            color={config.color}
                            items={sectionData?.data || []}
                            loading={sectionData?.loading ?? true}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Homepage;