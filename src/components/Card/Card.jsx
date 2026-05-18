import React, { useState, useEffect } from 'react';
import {
    getImageUrl,
    getTitle,
    getOriginalTitle,
    getOverview,
    getVoteAverage,
    getLanguage,
    getMediaType,
    convertVoteToStars,
    renderStars,
    getFlagEmoji
} from '../../utils/helpers';
import { useMoviesAPI } from '../../hooks/useMoviesAPI';
import './Card.css';

const Card = ({ item }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [cast, setCast] = useState([]);
    const [genresString, setGenresString] = useState('');
    const { getItemCast, getItemGenres } = useMoviesAPI();

    const title = getTitle(item);
    const originalTitle = getOriginalTitle(item);
    const overview = getOverview(item);
    const voteAverage = getVoteAverage(item);
    const language = getLanguage(item);
    const mediaType = getMediaType(item);
    const posterUrl = getImageUrl(item.poster_path);
    const rating = convertVoteToStars(voteAverage);
    const { fullStars, emptyStars } = renderStars(rating);

    useEffect(() => {
        const loadDetails = async () => {
            if (showDetails) {
                const itemGenres = getItemGenres(item);
                setGenresString(itemGenres);

                const itemCast = await getItemCast(item);
                setCast(itemCast);
            }
        };

        loadDetails();
    }, [showDetails, item, getItemGenres, getItemCast]);

    return (
        <div
            className="card"
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
        >
            {posterUrl ? (
                <img src={posterUrl} alt={title} className="card-poster" />
            ) : (
                <div className="card-placeholder">
                    <span>🎬</span>
                    <p>{title}</p>
                </div>
            )}

            {showDetails && (
                <div className="card-overlay">
                    <div className="card-details">
                        <h3 className="card-title">{title}</h3>
                        <p className="card-original-title">
                            <strong>Titolo originale:</strong> {originalTitle}
                        </p>
                        <p className="card-language">
                            <strong>Lingua:</strong> {getFlagEmoji(language)} {language.toUpperCase()}
                        </p>
                        <p className="card-rating">
                            <strong>Voto:</strong>{' '}
                            <span className="stars">
                                {fullStars.map((star, i) => (
                                    <span key={`full-${i}`} className="star full">★</span>
                                ))}
                                {emptyStars.map((star, i) => (
                                    <span key={`empty-${i}`} className="star empty">☆</span>
                                ))}
                            </span>
                        </p>
                        <p className="card-type">
                            <strong>Tipo:</strong> {mediaType === 'movie' ? 'Film' : 'Serie TV'}
                        </p>
                        {genresString && (
                            <p className="card-genres">
                                <strong>Generi:</strong> {genresString}
                            </p>
                        )}
                        {cast.length > 0 && (
                            <p className="card-cast">
                                <strong>Cast:</strong> {cast.map(actor => actor.name).join(', ')}
                            </p>
                        )}
                        <p className="card-overview">
                            <strong>Descrizione:</strong> {overview.length > 150
                                ? overview.substring(0, 150) + '...'
                                : overview}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;