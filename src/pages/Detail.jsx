import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMoviesAPI } from '../hooks/useMoviesAPI';
import { getImageUrl, convertVoteToStars, renderStars, getFlagEmoji } from '../utils/helpers';
import './Detail.css';

const Detail = () => {
    const { type, id } = useParams(); // type: 'movie' o 'tv', id: ID del contenuto
    const navigate = useNavigate();
    const { getFullDetails } = useMoviesAPI();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, cast, trailer

    useEffect(() => {
        loadDetails();
        // Scroll to top quando si apre la pagina
        window.scrollTo(0, 0);
    }, [type, id]);

    const loadDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getFullDetails(parseInt(id), type);
            if (data) {
                setDetails(data);
            } else {
                setError('Contenuto non trovato');
            }
        } catch (err) {
            console.error('Errore nel caricamento dettagli:', err);
            setError('Errore nel caricamento dei dettagli');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // Torna alla pagina precedente
    };

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="loading-spinner"></div>
                <p>Caricamento dettagli...</p>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="detail-error">
                <h2>😢 {error || 'Contenuto non trovato'}</h2>
                <button onClick={handleBack} className="back-button">Torna indietro</button>
            </div>
        );
    }

    // Calcoli per la visualizzazione
    const title = details.title || details.name;
    const originalTitle = details.original_title || details.original_name;
    const posterUrl = getImageUrl(details.poster_path, 'w500');
    const backdropUrl = getImageUrl(details.backdrop_path, 'original');
    const rating = convertVoteToStars(details.vote_average || 0);
    const { fullStars, emptyStars } = renderStars(rating);
    const year = (details.release_date || details.first_air_date)?.split('-')[0] || 'Anno sconosciuto';
    const runtime = details.runtime || details.episode_run_time?.[0] || null;
    const status = details.status === 'Released' ? 'Uscito' : details.status === 'Returning Series' ? 'In corso' : details.status || 'Sconosciuto';

    // Formatta la durata
    const formatRuntime = (minutes) => {
        if (!minutes) return null;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    return (
        <div className="detail-page">
            {/* Hero Section con backdrop */}
            <div
                className="detail-hero"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.95) 100%), url(${backdropUrl || posterUrl})`
                }}
            >
                <div className="detail-hero-content">
                    <button onClick={handleBack} className="back-button-hero">
                        ← Torna indietro
                    </button>

                    <div className="detail-info-wrapper">
                        {/* Poster */}
                        <div className="detail-poster">
                            {posterUrl ? (
                                <img src={posterUrl} alt={title} />
                            ) : (
                                <div className="poster-placeholder">
                                    <span>🎬</span>
                                </div>
                            )}
                        </div>

                        {/* Info principali */}
                        <div className="detail-info">
                            <h1 className="detail-title">{title}</h1>

                            <div className="detail-meta">
                                <span className="meta-year">{year}</span>
                                {runtime && <span className="meta-runtime">⏱️ {formatRuntime(runtime)}</span>}
                                <span className="meta-status">{status}</span>
                                <span className="meta-rating">
                                    <span className="stars">
                                        {fullStars.map((star, i) => (
                                            <span key={`full-${i}`} className="star full">★</span>
                                        ))}
                                        {emptyStars.map((star, i) => (
                                            <span key={`empty-${i}`} className="star empty">☆</span>
                                        ))}
                                    </span>
                                    <span className="rating-number">({details.vote_average?.toFixed(1) || 'N/A'})</span>
                                </span>
                            </div>

                            {details.tagline && (
                                <p className="detail-tagline">"{details.tagline}"</p>
                            )}

                            <div className="detail-genres">
                                {details.genres?.map(genre => (
                                    <span key={genre.id} className="genre-badge">{genre.name}</span>
                                ))}
                            </div>

                            <div className="detail-language">
                                <strong>Lingua originale:</strong> {getFlagEmoji(details.original_language)} {details.original_language?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenuto dettagliato */}
            <div className="detail-content">
                {/* Tabs */}
                <div className="detail-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📖 Panoramica
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'cast' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cast')}
                    >
                        🎭 Cast ({details.credits?.length || 0})
                    </button>
                    {details.trailer && (
                        <button
                            className={`tab-btn ${activeTab === 'trailer' ? 'active' : ''}`}
                            onClick={() => setActiveTab('trailer')}
                        >
                            🎬 Trailer
                        </button>
                    )}
                </div>

                {/* Contenuto dei tabs */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-content">
                            <h3>Trama</h3>
                            <p className="detail-overview">{details.overview || 'Descrizione non disponibile'}</p>

                            {/* Info aggiuntive */}
                            <div className="additional-info">
                                <div className="info-row">
                                    <span className="info-label">Produzione:</span>
                                    <span className="info-value">
                                        {details.production_companies?.map(c => c.name).join(', ') || 'N/A'}
                                    </span>
                                </div>
                                {details.budget > 0 && (
                                    <div className="info-row">
                                        <span className="info-label">Budget:</span>
                                        <span className="info-value">${details.budget.toLocaleString()}</span>
                                    </div>
                                )}
                                {details.revenue > 0 && (
                                    <div className="info-row">
                                        <span className="info-label">Incassi:</span>
                                        <span className="info-value">${details.revenue.toLocaleString()}</span>
                                    </div>
                                )}
                                {details.number_of_seasons && (
                                    <div className="info-row">
                                        <span className="info-label">Stagioni:</span>
                                        <span className="info-value">{details.number_of_seasons}</span>
                                    </div>
                                )}
                                {details.number_of_episodes && (
                                    <div className="info-row">
                                        <span className="info-label">Episodi:</span>
                                        <span className="info-value">{details.number_of_episodes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cast' && (
                        <div className="cast-content">
                            <h3>Cast Principale</h3>
                            <div className="cast-grid">
                                {details.credits?.map((actor, index) => (
                                    <div key={actor.id || index} className="cast-card">
                                        {actor.profile_path ? (
                                            <img
                                                src={getImageUrl(actor.profile_path, 'w185')}
                                                alt={actor.name}
                                                className="cast-photo"
                                            />
                                        ) : (
                                            <div className="cast-photo-placeholder">🎭</div>
                                        )}
                                        <div className="cast-info">
                                            <div className="cast-name">{actor.name}</div>
                                            <div className="cast-character">{actor.character}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'trailer' && details.trailer && (
                        <div className="trailer-content">
                            <h3>Trailer Ufficiale</h3>
                            <div className="trailer-wrapper">
                                <iframe
                                    src={details.trailer}
                                    title="Trailer"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Detail;