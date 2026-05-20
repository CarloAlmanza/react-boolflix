import React from 'react';
import { useHomepageData } from '../../hooks/useHomepageData';
import Section from './Section';
import './Homepage.css';

const Homepage = () => {
    const { sections, sectionsConfig } = useHomepageData();

    return (
        <div className="homepage">
            {/* Hero Section - Banner principale */}
            <div className="hero-section">
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
                {sectionsConfig.map((config) => (
                    <Section
                        key={config.id}
                        config={config}
                        data={sections[config.id]?.data || []}
                        loading={sections[config.id]?.loading || true}
                    />
                ))}
            </div>
        </div>
    );
};

export default Homepage;