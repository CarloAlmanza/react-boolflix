import { useState, useEffect } from 'react';
import { useMoviesAPI } from './useMoviesAPI';

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

    // Prendiamo le funzioni dall'API
    const {
        getTrendingToday,
        getTrendingThisWeek,
        getTopRatedMovies,
        getTopRatedTV,
        getPopularMovies,
        getPopularTV,
        getRecommendations
    } = useMoviesAPI();

    // Funzione per caricare una singola sezione
    const loadSection = async (sectionName, fetchFunction) => {
        console.log(`Caricamento sezione: ${sectionName}`); // Debug

        setSections(prev => ({
            ...prev,
            [sectionName]: { ...prev[sectionName], loading: true, error: null }
        }));

        try {
            const data = await fetchFunction();
            console.log(`Dati ricevuti per ${sectionName}:`, data.length); // Debug

            setSections(prev => ({
                ...prev,
                [sectionName]: { data: data || [], loading: false, error: null }
            }));
        } catch (error) {
            console.error(`Errore nel caricamento di ${sectionName}:`, error);
            setSections(prev => ({
                ...prev,
                [sectionName]: { data: [], loading: false, error: error.message }
            }));
        }
    };

    // Carica tutti i dati della homepage
    const loadAllData = async () => {
        console.log("Caricamento dati homepage iniziato...");

        // Carichiamo tutte le sezioni in parallelo
        await Promise.all([
            loadSection('trendingToday', getTrendingToday),
            loadSection('trendingThisWeek', getTrendingThisWeek),
            loadSection('topRatedMovies', getTopRatedMovies),
            loadSection('topRatedTV', getTopRatedTV),
            loadSection('popularMovies', getPopularMovies),
            loadSection('popularTV', getPopularTV),
            loadSection('recommendations', getRecommendations)
        ]);

        console.log("Caricamento dati homepage completato!");
    };

    // Effetto che carica i dati all'inizio
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