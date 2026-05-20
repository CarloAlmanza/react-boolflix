// API Configuration
export const API_KEY = '7f18c44e37a427536bdd6111a12a82c5';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Language mapping for flags
export const languageFlags = {
    it: '🇮🇹',
    en: '🇬🇧',
    fr: '🇫🇷',
    de: '🇩🇪',
    es: '🇪🇸',
    pt: '🇵🇹',
    ru: '🇷🇺',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳',
    ar: '🇸🇦',
    hi: '🇮🇳',
    nl: '🇳🇱',
    pl: '🇵🇱',
    tr: '🇹🇷',
    sv: '🇸🇪',
    no: '🇳🇴',
    da: '🇩🇰',
    fi: '🇫🇮',
    el: '🇬🇷',
    cs: '🇨🇿',
    hu: '🇭🇺',
    ro: '🇷🇴',
    th: '🇹🇭',
    vi: '🇻🇳',
    id: '🇮🇩',
    ms: '🇲🇾'
};

// Convert vote average from 1-10 to 1-5 scale
export const convertVoteToStars = (voteAverage) => {
    if (!voteAverage && voteAverage !== 0) return 0;
    return Math.ceil(voteAverage / 2);
};

// Render stars based on rating
export const renderStars = (rating) => {
    const fullStars = rating;
    const emptyStars = 5 - rating;

    return {
        fullStars: Array(fullStars).fill('★'),
        emptyStars: Array(emptyStars).fill('☆')
    };
};

// Get flag emoji from language code
export const getFlagEmoji = (languageCode) => {
    const code = languageCode?.split('-')[0]?.toLowerCase();
    return languageFlags[code] || '🏳️';
};

// Get full image URL
export const getImageUrl = (posterPath, size = 'w342') => {
    if (!posterPath) return null;
    return `${IMAGE_BASE_URL}${size}${posterPath}`;
};

// Format title based on media type
export const getTitle = (item) => {
    return item.title || item.name || 'Titolo non disponibile';
};

// Get original title based on media type
export const getOriginalTitle = (item) => {
    return item.original_title || item.original_name || 'Originale non disponibile';
};

// Get overview
export const getOverview = (item) => {
    return item.overview || 'Descrizione non disponibile';
};

// Get vote average
export const getVoteAverage = (item) => {
    return item.vote_average || 0;
};

// Get language
export const getLanguage = (item) => {
    return item.original_language || 'it';
};

// Get media type
export const getMediaType = (item) => {
    return item.media_type || (item.title ? 'movie' : 'tv');
};

// Fetch movie genres
export const fetchGenres = async () => {
    try {
        const [movieGenres, tvGenres] = await Promise.all([
            fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=it-IT`).then(res => res.json()),
            fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=it-IT`).then(res => res.json())
        ]);

        return {
            movie: movieGenres.genres || [],
            tv: tvGenres.genres || []
        };
    } catch (error) {
        console.error('Error fetching genres:', error);
        return { movie: [], tv: [] };
    }
};

// Fetch cast for a movie/tv show
export const fetchCast = async (id, type) => {
    try {
        const response = await fetch(
            `${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=it-IT`
        );
        const data = await response.json();
        return data.cast?.slice(0, 5) || [];
    } catch (error) {
        console.error('Error fetching cast:', error);
        return [];
    }
};

// Get genres string for an item
export const getGenresString = (genreIds, genresList) => {
    if (!genreIds || !genresList) return '';
    const itemGenres = genreIds
        .map(id => genresList.find(g => g.id === id)?.name)
        .filter(Boolean);
    return itemGenres.join(', ');
};

// NUOVE FUNZIONI PER HOMEPAGE

// Fetch film più votati
export const fetchTopRatedMovies = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        return data.results.map(item => ({ ...item, media_type: 'movie' }));
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        return [];
    }
};

// Fetch serie più votate
export const fetchTopRatedTV = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        return data.results.map(item => ({ ...item, media_type: 'tv' }));
    } catch (error) {
        console.error('Error fetching top rated TV:', error);
        return [];
    }
};

// Fetch film più popolari
export const fetchPopularMovies = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        return data.results.map(item => ({ ...item, media_type: 'movie' }));
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
};

// Fetch serie più popolari
export const fetchPopularTV = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=it-IT&page=1`
        );
        const data = await response.json();
        return data.results.map(item => ({ ...item, media_type: 'tv' }));
    } catch (error) {
        console.error('Error fetching popular TV:', error);
        return [];
    }
};

// Fetch trending (oggi)
export const fetchTrendingToday = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=it-IT`
        );
        const data = await response.json();
        return data.results.map(item => ({
            ...item,
            media_type: item.media_type || (item.title ? 'movie' : 'tv')
        }));
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
};

// Fetch trending (questa settimana)
export const fetchTrendingThisWeek = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=it-IT`
        );
        const data = await response.json();
        return data.results.map(item => ({
            ...item,
            media_type: item.media_type || (item.title ? 'movie' : 'tv')
        }));
    } catch (error) {
        console.error('Error fetching trending week:', error);
        return [];
    }
};

// Fetch raccomandazioni (basate sui film più votati)
export const fetchRecommendations = async () => {
    try {
        // Prendo un film popolare a caso e prendo le sue raccomandazioni
        const popularResponse = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=it-IT&page=1`
        );
        const popularData = await popularResponse.json();

        if (popularData.results.length > 0) {
            const randomMovie = popularData.results[Math.floor(Math.random() * popularData.results.length)];
            const recommendationsResponse = await fetch(
                `${BASE_URL}/movie/${randomMovie.id}/recommendations?api_key=${API_KEY}&language=it-IT`
            );
            const recommendationsData = await recommendationsResponse.json();
            return recommendationsData.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
};