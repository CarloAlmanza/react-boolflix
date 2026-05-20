import { useState, useEffect } from 'react';
import {
    fetchTopRatedMovies,
    fetchTopRatedTV,
    fetchPopularMovies,
    fetchPopularTV,
    fetchTrendingToday,
    fetchTrendingThisWeek,
    fetchRecommendations
} from '../utils/helpers';

export const useHomepageData = () => {
    const [sections, setSections] = useState({
        trendingToday: { data: [], loading: true, error: null },
        trendingThisWeek: { data: [], loading: true, error: null },
        topRatedMovies: { data: [], loading: true, error: null },
        topRatedTV: { data: [], loading: true, error: null },
        popularMovies: { data: [], loading: true, error: null },
        popularTV: { data: [], loading: true, error: null },
        recommendations: { data: [], loading: true, error: null }
    });

    const loadSection = async (sectionName, fetchFunction) => {
        setSections(prev => ({
            ...prev,
            [sectionName]: { ...prev[sectionName], loading: true, error: null }
        }));

        try {
            const data = await fetchFunction();
            setSections(prev => ({
                ...prev,
                [sectionName]: { data, loading: false, error: null }
            }));
        } catch (error) {
            setSections(prev => ({
                ...prev,
                [sectionName]: { data: [], loading: false, error: error.message }
            }));
        }
    };

    const loadAllData = async () => {
        await Promise.all([
            loadSection('trendingToday', fetchTrendingToday),
            loadSection('trendingThisWeek', fetchTrendingThisWeek),
            loadSection('topRatedMovies', fetchTopRatedMovies),
            loadSection('topRatedTV', fetchTopRatedTV),
            loadSection('popularMovies', fetchPopularMovies),
            loadSection('popularTV', fetchPopularTV),
            loadSection('recommendations', fetchRecommendations)
        ]);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Configurazione delle sezioni per la visualizzazione
    const sectionsConfig = [
        {
            id: 'trendingToday',
            title: '🔥 Tendenza del Giorno',
            icon: '🔥',
            color: '#e50914'
        },
        {
            id: 'trendingThisWeek',
            title: '⭐ Tendenza della Settimana',
            icon: '⭐',
            color: '#ffa500'
        },
        {
            id: 'topRatedMovies',
            title: '🏆 Film Più Votati',
            icon: '🏆',
            color: '#ffd700'
        },
        {
            id: 'topRatedTV',
            title: '📺 Serie Più Votate',
            icon: '📺',
            color: '#4caf50'
        },
        {
            id: 'popularMovies',
            title: '🔥 Film Più Popolari',
            icon: '🔥',
            color: '#ff6b6b'
        },
        {
            id: 'popularTV',
            title: '📈 Serie Più Popolari',
            icon: '📈',
            color: '#4ecdc4'
        },
        {
            id: 'recommendations',
            title: '🍿 Consigliati per Te',
            icon: '🍿',
            color: '#e91e63'
        }
    ];

    return { sections, sectionsConfig, loadAllData };
};