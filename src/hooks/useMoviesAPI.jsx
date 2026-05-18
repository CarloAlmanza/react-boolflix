import { useState } from 'react';
import { API_KEY, BASE_URL, fetchCast, fetchGenres, getGenresString } from '../utils/helpers';

export const useMoviesAPI = () => {
    const [allGenres, setAllGenres] = useState({ movie: [], tv: [] });

    const searchMovies = async (query) => {
        if (!query.trim()) return [];

        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
            );
            const data = await response.json();
            return data.results.map(item => ({ ...item, media_type: 'movie' }));
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    };

    const searchSeries = async (query) => {
        if (!query.trim()) return [];

        try {
            const response = await fetch(
                `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=it-IT`
            );
            const data = await response.json();
            return data.results.map(item => ({ ...item, media_type: 'tv' }));
        } catch (error) {
            console.error('Error searching series:', error);
            return [];
        }
    };

    const searchAll = async (query) => {
        const [movies, series] = await Promise.all([
            searchMovies(query),
            searchSeries(query)
        ]);

        return { movies, series };
    };

    const loadGenres = async () => {
        const genres = await fetchGenres();
        setAllGenres(genres);
        return genres;
    };

    const getItemGenres = (item) => {
        const genreIds = item.genre_ids || [];
        const genresList = item.media_type === 'movie' ? allGenres.movie : allGenres.tv;
        return getGenresString(genreIds, genresList);
    };

    const getItemCast = async (item) => {
        return await fetchCast(item.id, item.media_type);
    };

    return {
        searchAll,
        loadGenres,
        getItemGenres,
        getItemCast,
        allGenres
    };
};