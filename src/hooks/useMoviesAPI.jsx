import { useState } from 'react';
import {
    API_KEY,
    BASE_URL,
    fetchCast,
    fetchGenres,
    getGenresString,
    // Funzioni per la homepage
    fetchTopRatedMovies,
    fetchTopRatedTV,
    fetchPopularMovies,
    fetchPopularTV,
    fetchTrendingToday,
    fetchTrendingThisWeek,
    fetchRecommendations
} from '../utils/helpers';

export const useMoviesAPI = () => {
    // Stato per i generi (film e serie)
    const [allGenres, setAllGenres] = useState({ movie: [], tv: [] });

    // Stato per il caricamento delle varie sezioni
    const [loadingStates, setLoadingStates] = useState({
        search: false,
        suggestions: false,
        topRatedMovies: false,
        topRatedTV: false,
        popularMovies: false,
        popularTV: false,
        trendingToday: false,
        trendingThisWeek: false,
        recommendations: false,
        details: false
    });

    // ==================== FUNZIONI DI RICERCA ====================

    /**
     * Cerca film per titolo
     * @param {string} query - Il titolo da cercare
     * @returns {Promise<Array>} - Array di film trovati
     */
    const searchMovies = async (query) => {
        if (!query.trim()) return [];

        setLoadingStates(prev => ({ ...prev, search: true }));

        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
            );
            const data = await response.json();
            return data.results.map(item => ({
                ...item,
                media_type: 'movie',
                isMovie: true
            }));
        } catch (error) {
            console.error('Errore nella ricerca film:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, search: false }));
        }
    };

    /**
     * Cerca serie TV per titolo
     * @param {string} query - Il titolo da cercare
     * @returns {Promise<Array>} - Array di serie trovate
     */
    const searchSeries = async (query) => {
        if (!query.trim()) return [];

        setLoadingStates(prev => ({ ...prev, search: true }));

        try {
            const response = await fetch(
                `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
            );
            const data = await response.json();
            return data.results.map(item => ({
                ...item,
                media_type: 'tv',
                isTv: true
            }));
        } catch (error) {
            console.error('Errore nella ricerca serie:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, search: false }));
        }
    };

    /**
     * Cerca sia film che serie TV contemporaneamente
     * @param {string} query - Il titolo da cercare
     * @returns {Promise<Object>} - Oggetto con movies e series
     */
    const searchAll = async (query) => {
        if (!query.trim()) return { movies: [], series: [] };

        try {
            // Esegue entrambe le ricerche in parallelo per migliori performance
            const [movies, series] = await Promise.all([
                searchMovies(query),
                searchSeries(query)
            ]);

            return { movies, series };
        } catch (error) {
            console.error('Errore nella ricerca combinata:', error);
            return { movies: [], series: [] };
        }
    };

    /**
     * Cerca suggerimenti per l'autocomplete (senza filtri lingua)
     * @param {string} query - Il testo parziale da cercare
     * @returns {Promise<Array>} - Array di suggerimenti
     */
    const searchSuggestions = async (query) => {
        if (!query.trim() || query.length < 2) return [];

        setLoadingStates(prev => ({ ...prev, suggestions: true }));

        try {
            // Cerchiamo sia film che serie per i suggerimenti
            const [movies, series] = await Promise.all([
                fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`).then(res => res.json()),
                fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`).then(res => res.json())
            ]);

            // Combino e aggiungo il tipo
            const allSuggestions = [
                ...movies.results.map(m => ({
                    ...m,
                    media_type: 'movie',
                    display_type: '🎬 Film'
                })),
                ...series.results.map(s => ({
                    ...s,
                    media_type: 'tv',
                    display_type: '📺 Serie'
                }))
            ];

            // Ordino per popolarità (dal più popolare al meno)
            const sorted = allSuggestions.sort((a, b) => b.popularity - a.popularity);

            // Restituisco massimo 10 suggerimenti
            return sorted.slice(0, 10);
        } catch (error) {
            console.error('Errore nel recupero suggerimenti:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, suggestions: false }));
        }
    };

    // ==================== FUNZIONI PER I GENERI ====================

    /**
     * Carica tutti i generi (film e serie TV)
     * @returns {Promise<Object>} - Oggetto con generi film e serie
     */
    const loadGenres = async () => {
        try {
            const genres = await fetchGenres();
            setAllGenres(genres);
            return genres;
        } catch (error) {
            console.error('Errore nel caricamento generi:', error);
            return { movie: [], tv: [] };
        }
    };

    /**
     * Ottiene i generi di un item come stringa
     * @param {Object} item - Film o serie TV
     * @returns {string} - Stringa dei generi separati da virgola
     */
    const getItemGenres = (item) => {
        const genreIds = item.genre_ids || [];
        const genresList = item.media_type === 'movie' ? allGenres.movie : allGenres.tv;
        return getGenresString(genreIds, genresList);
    };

    /**
     * Ottiene il cast di un film/serie
     * @param {Object} item - Film o serie TV
     * @returns {Promise<Array>} - Array degli attori (max 5)
     */
    const getItemCast = async (item) => {
        try {
            return await fetchCast(item.id, item.media_type);
        } catch (error) {
            console.error('Errore nel recupero cast:', error);
            return [];
        }
    };

    // ==================== FUNZIONI PER DETTAGLI COMPLETI ====================

    /**
     * Ottiene dettagli completi di un film/serie (incluso cast, trailer, raccomandazioni simili)
     * @param {number} id - ID del contenuto
     * @param {string} type - 'movie' o 'tv'
     * @returns {Promise<Object>} - Dettagli completi
     */
    const getFullDetails = async (id, type) => {
        setLoadingStates(prev => ({ ...prev, details: true }));

        try {
            // Esegue chiamate multiple in parallelo per massima efficienza
            const [details, credits, videos, recommendations, similar] = await Promise.all([
                fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=it-IT`).then(res => res.json()),
                fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=it-IT`).then(res => res.json()),
                fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=it-IT`).then(res => res.json()),
                fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}&language=it-IT`).then(res => res.json()),
                fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}&language=it-IT`).then(res => res.json())
            ]);

            // Verifica se i dettagli sono stati trovati
            if (!details || details.success === false) {
                console.error('Dettagli non trovati per ID:', id);
                return null;
            }

            // Trova il trailer (preferibilmente in italiano o inglese)
            const trailer = videos.results.find(
                video => video.type === 'Trailer' && (video.iso_639_1 === 'it' || video.iso_639_1 === 'en')
            ) || videos.results.find(video => video.type === 'Trailer');

            // Trova il teaser (se non c'è trailer)
            const teaser = !trailer ? videos.results.find(
                video => video.type === 'Teaser' && (video.iso_639_1 === 'it' || video.iso_639_1 === 'en')
            ) : null;

            // Prepara il cast (primi 15 attori con dettagli aggiuntivi)
            const mainCast = credits.cast?.slice(0, 15).map(actor => ({
                id: actor.id,
                name: actor.name,
                character: actor.character,
                profile_path: actor.profile_path,
                popularity: actor.popularity
            })) || [];

            // Prepara la crew (registi, scrittori, produttori)
            const directors = credits.crew?.filter(person => person.job === 'Director') || [];
            const writers = credits.crew?.filter(person => person.job === 'Writer' || person.job === 'Screenplay') || [];
            const producers = credits.crew?.filter(person => person.job === 'Producer') || [];

            // Prepara le raccomandazioni (max 10)
            const recommendationsList = recommendations.results?.slice(0, 10).map(item => ({
                ...item,
                media_type: type,
                isRecommendation: true
            })) || [];

            // Prepara i contenuti simili (max 10)
            const similarList = similar.results?.slice(0, 10).map(item => ({
                ...item,
                media_type: type,
                isSimilar: true
            })) || [];

            // Calcola statistiche aggiuntive
            const votePercentage = details.vote_average ? Math.round(details.vote_average * 10) : 0;
            const userScore = votePercentage;

            // Restituisce l'oggetto completo
            return {
                // Info base
                id: details.id,
                title: details.title || details.name,
                originalTitle: details.original_title || details.original_name,
                overview: details.overview,
                tagline: details.tagline,

                // Date e durata
                releaseDate: details.release_date || details.first_air_date,
                lastAirDate: details.last_air_date,
                year: (details.release_date || details.first_air_date)?.split('-')[0],

                // Numeri e voti
                runtime: details.runtime,
                episodeRunTime: details.episode_run_time?.[0],
                voteAverage: details.vote_average,
                voteCount: details.vote_count,
                votePercentage: votePercentage,
                userScore: userScore,

                // Media e immagini
                posterPath: details.poster_path,
                backdropPath: details.backdrop_path,
                posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
                backdropUrl: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,

                // Generi
                genres: details.genres || [],

                // Produzione
                productionCompanies: details.production_companies || [],
                productionCountries: details.production_countries || [],

                // Budget e incassi (solo per film)
                budget: details.budget,
                revenue: details.revenue,

                // Status e lingue
                status: details.status,
                originalLanguage: details.original_language,
                spokenLanguages: details.spoken_languages || [],

                // Serie TV specifiche
                numberOfSeasons: details.number_of_seasons,
                numberOfEpisodes: details.number_of_episodes,
                seasons: details.seasons,

                // Media type
                mediaType: type,

                // Cast e crew
                cast: mainCast,
                directors: directors,
                writers: writers,
                producers: producers,
                fullCast: credits.cast || [],
                fullCrew: credits.crew || [],

                // Video e trailer
                videos: videos.results || [],
                trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
                teaser: teaser ? `https://www.youtube.com/embed/${teaser.key}` : null,

                // Raccomandazioni e simili
                recommendations: recommendationsList,
                similar: similarList,

                // Metadati
                isMovie: type === 'movie',
                isTv: type === 'tv',
                isAdult: details.adult,
                homepage: details.homepage,
                imdbId: details.imdb_id
            };
        } catch (error) {
            console.error('Errore nel recupero dettagli completi:', error);
            return null;
        } finally {
            setLoadingStates(prev => ({ ...prev, details: false }));
        }
    };

    /**
     * Ottiene solo il trailer di un film/serie (più leggero)
     * @param {number} id - ID del contenuto
     * @param {string} type - 'movie' o 'tv'
     * @returns {Promise<string|null>} - URL del trailer o null
     */
    const getTrailerOnly = async (id, type) => {
        try {
            const response = await fetch(
                `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=it-IT`
            );
            const data = await response.json();

            const trailer = data.results.find(
                video => video.type === 'Trailer' && (video.iso_639_1 === 'it' || video.iso_639_1 === 'en')
            ) || data.results.find(video => video.type === 'Trailer');

            return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
        } catch (error) {
            console.error('Errore nel recupero trailer:', error);
            return null;
        }
    };

    /**
     * Ottiene solo il cast di un film/serie (più leggero)
     * @param {number} id - ID del contenuto
     * @param {string} type - 'movie' o 'tv'
     * @returns {Promise<Array>} - Array degli attori
     */
    const getCastOnly = async (id, type) => {
        try {
            const response = await fetch(
                `${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=it-IT`
            );
            const data = await response.json();
            return data.cast?.slice(0, 10) || [];
        } catch (error) {
            console.error('Errore nel recupero cast:', error);
            return [];
        }
    };

    // ==================== FUNZIONI PER HOMEPAGE ====================

    /**
     * Carica i film più votati
     * @returns {Promise<Array>} - Array di film
     */
    const getTopRatedMovies = async () => {
        setLoadingStates(prev => ({ ...prev, topRatedMovies: true }));
        try {
            const data = await fetchTopRatedMovies();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento film più votati:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, topRatedMovies: false }));
        }
    };

    /**
     * Carica le serie più votate
     * @returns {Promise<Array>} - Array di serie
     */
    const getTopRatedTV = async () => {
        setLoadingStates(prev => ({ ...prev, topRatedTV: true }));
        try {
            const data = await fetchTopRatedTV();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento serie più votate:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, topRatedTV: false }));
        }
    };

    /**
     * Carica i film più popolari
     * @returns {Promise<Array>} - Array di film
     */
    const getPopularMovies = async () => {
        setLoadingStates(prev => ({ ...prev, popularMovies: true }));
        try {
            const data = await fetchPopularMovies();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento film popolari:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, popularMovies: false }));
        }
    };

    /**
     * Carica le serie più popolari
     * @returns {Promise<Array>} - Array di serie
     */
    const getPopularTV = async () => {
        setLoadingStates(prev => ({ ...prev, popularTV: true }));
        try {
            const data = await fetchPopularTV();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento serie popolari:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, popularTV: false }));
        }
    };

    /**
     * Carica i contenuti in tendenza oggi
     * @returns {Promise<Array>} - Array di film/serie in tendenza
     */
    const getTrendingToday = async () => {
        setLoadingStates(prev => ({ ...prev, trendingToday: true }));
        try {
            const data = await fetchTrendingToday();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento tendenze oggi:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, trendingToday: false }));
        }
    };

    /**
     * Carica i contenuti in tendenza questa settimana
     * @returns {Promise<Array>} - Array di film/serie in tendenza
     */
    const getTrendingThisWeek = async () => {
        setLoadingStates(prev => ({ ...prev, trendingThisWeek: true }));
        try {
            const data = await fetchTrendingThisWeek();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento tendenze settimana:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, trendingThisWeek: false }));
        }
    };

    /**
     * Carica raccomandazioni basate su un film popolare
     * @returns {Promise<Array>} - Array di film raccomandati
     */
    const getRecommendations = async () => {
        setLoadingStates(prev => ({ ...prev, recommendations: true }));
        try {
            const data = await fetchRecommendations();
            return data;
        } catch (error) {
            console.error('Errore nel caricamento raccomandazioni:', error);
            return [];
        } finally {
            setLoadingStates(prev => ({ ...prev, recommendations: false }));
        }
    };

    /**
     * Carica TUTTI i dati della homepage in parallelo
     * @returns {Promise<Object>} - Oggetto con tutti i dati della homepage
     */
    const loadAllHomepageData = async () => {
        try {
            // Esegue tutte le chiamate in parallelo per massima velocità
            const [
                trendingToday,
                trendingThisWeek,
                topRatedMovies,
                topRatedTV,
                popularMovies,
                popularTV,
                recommendations
            ] = await Promise.all([
                getTrendingToday(),
                getTrendingThisWeek(),
                getTopRatedMovies(),
                getTopRatedTV(),
                getPopularMovies(),
                getPopularTV(),
                getRecommendations()
            ]);

            return {
                trendingToday,
                trendingThisWeek,
                topRatedMovies,
                topRatedTV,
                popularMovies,
                popularTV,
                recommendations
            };
        } catch (error) {
            console.error('Errore nel caricamento dati homepage:', error);
            return {
                trendingToday: [],
                trendingThisWeek: [],
                topRatedMovies: [],
                topRatedTV: [],
                popularMovies: [],
                popularTV: [],
                recommendations: []
            };
        }
    };

    // ==================== FUNZIONI DI UTILITY ====================

    /**
     * Resetta tutti gli stati di caricamento
     */
    const resetLoadingStates = () => {
        setLoadingStates({
            search: false,
            suggestions: false,
            topRatedMovies: false,
            topRatedTV: false,
            popularMovies: false,
            popularTV: false,
            trendingToday: false,
            trendingThisWeek: false,
            recommendations: false,
            details: false
        });
    };

    /**
     * Verifica se una qualsiasi sezione è in caricamento
     * @returns {boolean} - True se almeno una sezione sta caricando
     */
    const isAnyLoading = () => {
        return Object.values(loadingStates).some(state => state === true);
    };

    // ==================== EXPORT ====================

    return {
        // Funzioni di ricerca base
        searchMovies,
        searchSeries,
        searchAll,
        searchSuggestions,

        // Funzioni per dettagli completi
        getFullDetails,
        getTrailerOnly,
        getCastOnly,

        // Funzioni per homepage
        getTopRatedMovies,
        getTopRatedTV,
        getPopularMovies,
        getPopularTV,
        getTrendingToday,
        getTrendingThisWeek,
        getRecommendations,
        loadAllHomepageData,

        // Funzioni generi e cast
        loadGenres,
        getItemGenres,
        getItemCast,

        // Utility
        resetLoadingStates,
        isAnyLoading,

        // Stati
        allGenres,
        loadingStates
    };
};